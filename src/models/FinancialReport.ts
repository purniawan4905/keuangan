import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialReport extends Document {
  _id: string;
  hospitalId: string;
  reportType: 'monthly' | 'quarterly' | 'annual';
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  revenue: {
    patientCare: number;
    emergencyServices: number;
    surgery: number;
    laboratory: number;
    pharmacy: number;
    other: number;
  };
  expenses: {
    salaries: number;
    medicalSupplies: number;
    equipment: number;
    utilities: number;
    maintenance: number;
    insurance: number;
    other: number;
  };
  assets: {
    current: {
      cash: number;
      accountsReceivable: number;
      inventory: number;
      other: number;
    };
    fixed: {
      buildings: number;
      equipment: number;
      vehicles: number;
      other: number;
    };
  };
  liabilities: {
    current: {
      accountsPayable: number;
      shortTermDebt: number;
      accruedExpenses: number;
      other: number;
    };
    longTerm: {
      longTermDebt: number;
      other: number;
    };
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    currentEarnings: number;
  };
  tax: {
    income: number;
    rate: number;
    amount: number;
    deductions: number;
    netTaxable: number;
  };
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    isBalanced: boolean;
  };
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialReportSchema = new Schema<IFinancialReport>({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    trim: true
  },
  reportType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    required: [true, 'Report type is required']
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  month: {
    type: Number,
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  quarter: {
    type: Number,
    min: [1, 'Quarter must be between 1 and 4'],
    max: [4, 'Quarter must be between 1 and 4']
  },
  revenue: {
    patientCare: { type: Number, default: 0, min: 0 },
    emergencyServices: { type: Number, default: 0, min: 0 },
    surgery: { type: Number, default: 0, min: 0 },
    laboratory: { type: Number, default: 0, min: 0 },
    pharmacy: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  expenses: {
    salaries: { type: Number, default: 0, min: 0 },
    medicalSupplies: { type: Number, default: 0, min: 0 },
    equipment: { type: Number, default: 0, min: 0 },
    utilities: { type: Number, default: 0, min: 0 },
    maintenance: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 }
  },
  assets: {
    current: {
      cash: { type: Number, default: 0, min: 0 },
      accountsReceivable: { type: Number, default: 0, min: 0 },
      inventory: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    fixed: {
      buildings: { type: Number, default: 0, min: 0 },
      equipment: { type: Number, default: 0, min: 0 },
      vehicles: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  liabilities: {
    current: {
      accountsPayable: { type: Number, default: 0, min: 0 },
      shortTermDebt: { type: Number, default: 0, min: 0 },
      accruedExpenses: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    longTerm: {
      longTermDebt: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    }
  },
  equity: {
    capital: { type: Number, default: 0, min: 0 },
    retainedEarnings: { type: Number, default: 0 },
    currentEarnings: { type: Number, default: 0 }
  },
  tax: {
    income: { type: Number, default: 0 },
    rate: { type: Number, default: 0.25, min: 0, max: 1 },
    amount: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netTaxable: { type: Number, default: 0, min: 0 }
  },
  balanceSheet: {
    totalAssets: { type: Number, default: 0, min: 0 },
    totalLiabilities: { type: Number, default: 0, min: 0 },
    totalEquity: { type: Number, default: 0 },
    isBalanced: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
FinancialReportSchema.index({ hospitalId: 1, year: -1, month: -1 });
FinancialReportSchema.index({ reportType: 1, status: 1 });
FinancialReportSchema.index({ createdBy: 1 });
FinancialReportSchema.index({ period: 1 });

// Compound index for unique reports per period
FinancialReportSchema.index({ 
  hospitalId: 1, 
  reportType: 1, 
  year: 1, 
  month: 1, 
  quarter: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    status: { $ne: 'archived' } 
  }
});

export default mongoose.models.FinancialReport || mongoose.model<IFinancialReport>('FinancialReport', FinancialReportSchema);