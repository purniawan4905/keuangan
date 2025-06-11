import connectDB from '../lib/database';
import FinancialReport, { IFinancialReport } from '../models/FinancialReport';
import User from '../models/User';
import { FinancialReport as ReportType } from '../types';

export interface CreateReportData {
  hospitalId: string;
  reportType: 'monthly' | 'quarterly' | 'annual';
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  revenue: any;
  expenses: any;
  assets: any;
  liabilities: any;
  equity: any;
  tax: any;
  notes?: string;
  createdBy: string;
}

class ReportService {
  async createReport(data: CreateReportData): Promise<{ success: boolean; report?: IFinancialReport; message?: string }> {
    try {
      await connectDB();

      // Check if report already exists for this period
      const existingReport = await FinancialReport.findOne({
        hospitalId: data.hospitalId,
        reportType: data.reportType,
        year: data.year,
        ...(data.month && { month: data.month }),
        ...(data.quarter && { quarter: data.quarter }),
        status: { $ne: 'archived' }
      });

      if (existingReport) {
        return {
          success: false,
          message: 'Laporan untuk periode ini sudah ada'
        };
      }

      // Calculate balance sheet totals
      const totalCurrentAssets = Object.values(data.assets.current).reduce((a: number, b: number) => a + b, 0);
      const totalFixedAssets = Object.values(data.assets.fixed).reduce((a: number, b: number) => a + b, 0);
      const totalAssets = totalCurrentAssets + totalFixedAssets;

      const totalCurrentLiabilities = Object.values(data.liabilities.current).reduce((a: number, b: number) => a + b, 0);
      const totalLongTermLiabilities = Object.values(data.liabilities.longTerm).reduce((a: number, b: number) => a + b, 0);
      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

      const totalEquity = data.equity.capital + data.equity.retainedEarnings + data.equity.currentEarnings;

      const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

      const newReport = new FinancialReport({
        ...data,
        balanceSheet: {
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced
        },
        status: 'draft'
      });

      await newReport.save();

      return {
        success: true,
        report: newReport,
        message: 'Laporan berhasil dibuat'
      };

    } catch (error) {
      console.error('Create report error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat membuat laporan'
      };
    }
  }

  async getReportsByHospital(hospitalId: string, filters?: {
    reportType?: string;
    status?: string;
    year?: number;
    limit?: number;
    skip?: number;
  }): Promise<IFinancialReport[]> {
    try {
      await connectDB();

      const query: any = { hospitalId };

      if (filters?.reportType && filters.reportType !== 'all') {
        query.reportType = filters.reportType;
      }

      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      }

      if (filters?.year) {
        query.year = filters.year;
      }

      const reports = await FinancialReport.find(query)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ year: -1, month: -1, quarter: -1 })
        .limit(filters?.limit || 50)
        .skip(filters?.skip || 0);

      return reports;

    } catch (error) {
      console.error('Get reports error:', error);
      return [];
    }
  }

  async getReportById(reportId: string): Promise<IFinancialReport | null> {
    try {
      await connectDB();

      const report = await FinancialReport.findById(reportId)
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');

      return report;

    } catch (error) {
      console.error('Get report error:', error);
      return null;
    }
  }

  async updateReport(reportId: string, updateData: Partial<CreateReportData>, updatedBy: string): Promise<{ success: boolean; report?: IFinancialReport; message?: string }> {
    try {
      await connectDB();

      const report = await FinancialReport.findById(reportId);
      if (!report) {
        return {
          success: false,
          message: 'Laporan tidak ditemukan'
        };
      }

      // Check if user can edit this report
      const user = await User.findById(updatedBy);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan'
        };
      }

      // Only allow editing if report is in draft status or user is admin
      if (report.status !== 'draft' && user.role !== 'admin') {
        return {
          success: false,
          message: 'Laporan yang sudah disubmit tidak dapat diedit'
        };
      }

      // Update balance sheet if financial data changed
      if (updateData.assets || updateData.liabilities || updateData.equity) {
        const assets = updateData.assets || report.assets;
        const liabilities = updateData.liabilities || report.liabilities;
        const equity = updateData.equity || report.equity;

        const totalCurrentAssets = Object.values(assets.current).reduce((a: number, b: number) => a + b, 0);
        const totalFixedAssets = Object.values(assets.fixed).reduce((a: number, b: number) => a + b, 0);
        const totalAssets = totalCurrentAssets + totalFixedAssets;

        const totalCurrentLiabilities = Object.values(liabilities.current).reduce((a: number, b: number) => a + b, 0);
        const totalLongTermLiabilities = Object.values(liabilities.longTerm).reduce((a: number, b: number) => a + b, 0);
        const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

        const totalEquity = equity.capital + equity.retainedEarnings + equity.currentEarnings;

        updateData.balanceSheet = {
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1
        };
      }

      const updatedReport = await FinancialReport.findByIdAndUpdate(
        reportId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return {
        success: true,
        report: updatedReport,
        message: 'Laporan berhasil diperbarui'
      };

    } catch (error) {
      console.error('Update report error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat memperbarui laporan'
      };
    }
  }

  async submitReport(reportId: string, submittedBy: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();

      const report = await FinancialReport.findById(reportId);
      if (!report) {
        return {
          success: false,
          message: 'Laporan tidak ditemukan'
        };
      }

      if (report.status !== 'draft') {
        return {
          success: false,
          message: 'Hanya laporan draft yang dapat disubmit'
        };
      }

      await FinancialReport.findByIdAndUpdate(reportId, {
        status: 'submitted',
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Laporan berhasil disubmit untuk persetujuan'
      };

    } catch (error) {
      console.error('Submit report error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat submit laporan'
      };
    }
  }

  async approveReport(reportId: string, approvedBy: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();

      const report = await FinancialReport.findById(reportId);
      if (!report) {
        return {
          success: false,
          message: 'Laporan tidak ditemukan'
        };
      }

      const user = await User.findById(approvedBy);
      if (!user || user.role !== 'admin') {
        return {
          success: false,
          message: 'Hanya admin yang dapat menyetujui laporan'
        };
      }

      if (report.status !== 'submitted') {
        return {
          success: false,
          message: 'Hanya laporan yang sudah disubmit yang dapat disetujui'
        };
      }

      await FinancialReport.findByIdAndUpdate(reportId, {
        status: 'approved',
        approvedBy: approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        message: 'Laporan berhasil disetujui'
      };

    } catch (error) {
      console.error('Approve report error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menyetujui laporan'
      };
    }
  }

  async deleteReport(reportId: string, deletedBy: string): Promise<{ success: boolean; message?: string }> {
    try {
      await connectDB();

      const report = await FinancialReport.findById(reportId);
      if (!report) {
        return {
          success: false,
          message: 'Laporan tidak ditemukan'
        };
      }

      const user = await User.findById(deletedBy);
      if (!user || user.role !== 'admin') {
        return {
          success: false,
          message: 'Hanya admin yang dapat menghapus laporan'
        };
      }

      await FinancialReport.findByIdAndDelete(reportId);

      return {
        success: true,
        message: 'Laporan berhasil dihapus'
      };

    } catch (error) {
      console.error('Delete report error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menghapus laporan'
      };
    }
  }

  async getDashboardStats(hospitalId: string): Promise<any> {
    try {
      await connectDB();

      const reports = await FinancialReport.find({ 
        hospitalId,
        status: 'approved'
      }).sort({ year: -1, month: -1 });

      if (reports.length === 0) {
        return {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          totalEquity: 0,
          taxAmount: 0,
          revenueGrowth: 0,
          profitMargin: 0,
          currentRatio: 0,
          debtToEquityRatio: 0
        };
      }

      const latestReport = reports[0];
      const previousReport = reports.length > 1 ? reports[1] : null;

      const totalRevenue = Object.values(latestReport.revenue).reduce((a: number, b: number) => a + b, 0);
      const totalExpenses = Object.values(latestReport.expenses).reduce((a: number, b: number) => a + b, 0);
      const netProfit = totalRevenue - totalExpenses;

      let revenueGrowth = 0;
      if (previousReport) {
        const previousRevenue = Object.values(previousReport.revenue).reduce((a: number, b: number) => a + b, 0);
        revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      }

      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const totalCurrentAssets = Object.values(latestReport.assets.current).reduce((a: number, b: number) => a + b, 0);
      const totalCurrentLiabilities = Object.values(latestReport.liabilities.current).reduce((a: number, b: number) => a + b, 0);
      const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;

      const debtToEquityRatio = latestReport.balanceSheet.totalEquity > 0 ? 
        latestReport.balanceSheet.totalLiabilities / latestReport.balanceSheet.totalEquity : 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalAssets: latestReport.balanceSheet.totalAssets,
        totalLiabilities: latestReport.balanceSheet.totalLiabilities,
        totalEquity: latestReport.balanceSheet.totalEquity,
        taxAmount: latestReport.tax.amount,
        revenueGrowth,
        profitMargin,
        currentRatio,
        debtToEquityRatio
      };

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return null;
    }
  }
}

export default new ReportService();