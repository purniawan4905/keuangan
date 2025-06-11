import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Building, CreditCard, FileText, Download, Calendar, Scale } from 'lucide-react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { mockReports, calculateDashboardStats } from '../../utils/mockData';
import { FinancialReport, DashboardStats } from '../../types';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    // In real app, fetch from API
    setReports(mockReports);
    setStats(calculateDashboardStats(mockReports));
  }, []);

  const handleCreateReport = () => {
    navigate('/reports');
  };

  const handleExportPDF = () => {
    if (reports.length > 0) {
      exportToPDF(reports[0], 'dashboard');
      toast.success('PDF berhasil diekspor');
    }
  };

  const handleExportExcel = () => {
    if (reports.length > 0) {
      exportToExcel(reports);
      toast.success('Excel berhasil diekspor');
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const revenueExpenseData = reports.map(report => ({
    name: report.period,
    pendapatan: Object.values(report.revenue).reduce((a, b) => a + b, 0) / 1000000,
    pengeluaran: Object.values(report.expenses).reduce((a, b) => a + b, 0) / 1000000,
  }));

  const revenueBreakdownData = reports.length > 0 ? [
    { name: 'Perawatan Pasien', value: reports[reports.length - 1].revenue.patientCare / 1000000, color: '#3B82F6' },
    { name: 'Layanan Darurat', value: reports[reports.length - 1].revenue.emergencyServices / 1000000, color: '#10B981' },
    { name: 'Operasi', value: reports[reports.length - 1].revenue.surgery / 1000000, color: '#F59E0B' },
    { name: 'Laboratorium', value: reports[reports.length - 1].revenue.laboratory / 1000000, color: '#EF4444' },
    { name: 'Farmasi', value: reports[reports.length - 1].revenue.pharmacy / 1000000, color: '#8B5CF6' },
    { name: 'Lainnya', value: reports[reports.length - 1].revenue.other / 1000000, color: '#6B7280' }
  ] : [];

  const profitTrendData = reports.map(report => {
    const revenue = Object.values(report.revenue).reduce((a, b) => a + b, 0);
    const expenses = Object.values(report.expenses).reduce((a, b) => a + b, 0);
    return {
      name: report.period,
      profit: (revenue - expenses) / 1000000,
    };
  });

  const balanceSheetData = reports.length > 0 ? [
    { name: 'Aset', value: stats.totalAssets / 1000000000, color: '#3B82F6' },
    { name: 'Kewajiban', value: stats.totalLiabilities / 1000000000, color: '#EF4444' },
    { name: 'Ekuitas', value: stats.totalEquity / 1000000000, color: '#10B981' }
  ] : [];

  return (
    <div id="dashboard" className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Keuangan</h1>
          <p className="text-gray-600 mt-1">Ringkasan laporan keuangan rumah sakit</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Periode</option>
            <option value="2024">2024</option>
            <option value="q1">Q1 2024</option>
            <option value="monthly">Bulanan</option>
          </select>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pendapatan"
          value={`Rp ${(stats.totalRevenue / 1000000000).toFixed(1)}M`}
          change={`+${stats.revenueGrowth.toFixed(1)}%`}
          changeType={stats.revenueGrowth >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Pengeluaran"
          value={`Rp ${(stats.totalExpenses / 1000000000).toFixed(1)}M`}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Laba Bersih"
          value={`Rp ${(stats.netProfit / 1000000000).toFixed(1)}M`}
          change={`${stats.profitMargin.toFixed(1)}% margin`}
          changeType={stats.profitMargin >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Total Aset"
          value={`Rp ${(stats.totalAssets / 1000000000).toFixed(1)}M`}
          icon={Building}
          color="purple"
        />
      </div>

      {/* Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Kewajiban"
          value={`Rp ${(stats.totalLiabilities / 1000000000).toFixed(1)}M`}
          icon={CreditCard}
          color="yellow"
        />
        <StatsCard
          title="Total Ekuitas"
          value={`Rp ${(stats.totalEquity / 1000000000).toFixed(1)}M`}
          icon={Scale}
          color="indigo"
        />
        <StatsCard
          title="Beban Pajak"
          value={`Rp ${(stats.taxAmount / 1000000).toFixed(0)}Jt`}
          change={`Rasio: ${((stats.taxAmount / stats.totalRevenue) * 100).toFixed(1)}%`}
          icon={FileText}
          color="red"
        />
      </div>

      {/* Financial Ratios */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rasio Keuangan</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.currentRatio.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Current Ratio</p>
            <p className="text-xs text-gray-500">Likuiditas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.debtToEquityRatio.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Debt to Equity</p>
            <p className="text-xs text-gray-500">Leverage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.profitMargin.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className="text-xs text-gray-500">Profitabilitas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{((stats.totalAssets / stats.totalRevenue) * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Asset Turnover</p>
            <p className="text-xs text-gray-500">Efisiensi</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
              <Legend />
              <Bar dataKey="pendapatan" fill="#10B981" name="Pendapatan" />
              <Bar dataKey="pengeluaran" fill="#EF4444" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Balance Sheet Composition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Komposisi Neraca</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={balanceSheetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {balanceSheetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Breakdown and Profit Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Pendapatan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Keuntungan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`Rp ${value}M`, 'Keuntungan']} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onCreateReport={handleCreateReport} />
    </div>
  );
};

export default Dashboard;