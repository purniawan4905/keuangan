import connectDB from '../lib/database';
import User from '../models/User';
import FinancialReport from '../models/FinancialReport';
import HospitalSettings from '../models/HospitalSettings';

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await FinancialReport.deleteMany({});
    await HospitalSettings.deleteMany({});
    console.log('Cleared existing data');

    // Create default admin user
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@hospital.com',
      password: 'password', // Will be hashed automatically
      role: 'admin',
      hospitalId: 'hospital-1',
      isActive: true
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create finance user
    const financeUser = new User({
      name: 'Finance Manager',
      email: 'finance@hospital.com',
      password: 'password',
      role: 'finance',
      hospitalId: 'hospital-1',
      isActive: true
    });
    await financeUser.save();
    console.log('Created finance user');

    // Create viewer user
    const viewerUser = new User({
      name: 'Viewer User',
      email: 'viewer@hospital.com',
      password: 'password',
      role: 'viewer',
      hospitalId: 'hospital-1',
      isActive: true
    });
    await viewerUser.save();
    console.log('Created viewer user');

    // Create hospital settings
    const hospitalSettings = new HospitalSettings({
      hospitalId: 'hospital-1',
      hospitalName: 'RS Sebening Kasih',
      address: 'Jl. Kesehatan No. 123, Jakarta',
      phone: '+62-21-1234567',
      email: 'admin@rsusebeningkasih.com',
      taxId: '01.234.567.8-901.000',
      fiscalYearStart: 1,
      currency: 'IDR',
      taxSettings: {
        corporateTaxRate: 0.25,
        vatRate: 0.11,
        withholdingTaxRate: 0.02,
        deductionTypes: ['Penyusutan Peralatan', 'Biaya Operasional', 'Biaya Penelitian', 'Biaya CSR']
      },
      reportingSettings: {
        autoApproval: false,
        requireDualApproval: true,
        archiveAfterMonths: 24
      },
      notificationSettings: {
        emailNotifications: true,
        reminderDays: [7, 3, 1]
      }
    });
    await hospitalSettings.save();
    console.log('Created hospital settings');

    // Create sample financial reports
    const sampleReports = [
      {
        hospitalId: 'hospital-1',
        reportType: 'monthly',
        period: 'Januari 2024',
        year: 2024,
        month: 1,
        revenue: {
          patientCare: 2500000000,
          emergencyServices: 800000000,
          surgery: 1200000000,
          laboratory: 400000000,
          pharmacy: 600000000,
          other: 200000000
        },
        expenses: {
          salaries: 1800000000,
          medicalSupplies: 900000000,
          equipment: 300000000,
          utilities: 200000000,
          maintenance: 150000000,
          insurance: 100000000,
          other: 250000000
        },
        assets: {
          current: {
            cash: 500000000,
            accountsReceivable: 800000000,
            inventory: 400000000,
            other: 100000000
          },
          fixed: {
            buildings: 15000000000,
            equipment: 8000000000,
            vehicles: 500000000,
            other: 1000000000
          }
        },
        liabilities: {
          current: {
            accountsPayable: 600000000,
            shortTermDebt: 300000000,
            accruedExpenses: 200000000,
            other: 100000000
          },
          longTerm: {
            longTermDebt: 5000000000,
            other: 500000000
          }
        },
        equity: {
          capital: 10000000000,
          retainedEarnings: 5000000000,
          currentEarnings: 2000000000
        },
        tax: {
          income: 2000000000,
          rate: 0.25,
          amount: 500000000,
          deductions: 500000000,
          netTaxable: 1500000000
        },
        status: 'approved',
        createdBy: adminUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date('2024-02-01')
      },
      {
        hospitalId: 'hospital-1',
        reportType: 'monthly',
        period: 'Februari 2024',
        year: 2024,
        month: 2,
        revenue: {
          patientCare: 2700000000,
          emergencyServices: 850000000,
          surgery: 1300000000,
          laboratory: 450000000,
          pharmacy: 650000000,
          other: 250000000
        },
        expenses: {
          salaries: 1850000000,
          medicalSupplies: 950000000,
          equipment: 320000000,
          utilities: 220000000,
          maintenance: 160000000,
          insurance: 105000000,
          other: 270000000
        },
        assets: {
          current: {
            cash: 600000000,
            accountsReceivable: 900000000,
            inventory: 450000000,
            other: 120000000
          },
          fixed: {
            buildings: 15000000000,
            equipment: 8200000000,
            vehicles: 520000000,
            other: 1050000000
          }
        },
        liabilities: {
          current: {
            accountsPayable: 650000000,
            shortTermDebt: 280000000,
            accruedExpenses: 220000000,
            other: 110000000
          },
          longTerm: {
            longTermDebt: 4800000000,
            other: 480000000
          }
        },
        equity: {
          capital: 10000000000,
          retainedEarnings: 5200000000,
          currentEarnings: 2325000000
        },
        tax: {
          income: 2325000000,
          rate: 0.25,
          amount: 581250000,
          deductions: 525000000,
          netTaxable: 1800000000
        },
        status: 'approved',
        createdBy: financeUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date('2024-03-01')
      }
    ];

    for (const reportData of sampleReports) {
      // Calculate balance sheet
      const totalCurrentAssets = Object.values(reportData.assets.current).reduce((a, b) => a + b, 0);
      const totalFixedAssets = Object.values(reportData.assets.fixed).reduce((a, b) => a + b, 0);
      const totalAssets = totalCurrentAssets + totalFixedAssets;

      const totalCurrentLiabilities = Object.values(reportData.liabilities.current).reduce((a, b) => a + b, 0);
      const totalLongTermLiabilities = Object.values(reportData.liabilities.longTerm).reduce((a, b) => a + b, 0);
      const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

      const totalEquity = reportData.equity.capital + reportData.equity.retainedEarnings + reportData.equity.currentEarnings;

      const report = new FinancialReport({
        ...reportData,
        balanceSheet: {
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1
        }
      });

      await report.save();
    }
    console.log('Created sample financial reports');

    console.log('Database seeded successfully!');
    console.log('\nDefault users created:');
    console.log('Admin: admin@hospital.com / password');
    console.log('Finance: finance@hospital.com / password');
    console.log('Viewer: viewer@hospital.com / password');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();