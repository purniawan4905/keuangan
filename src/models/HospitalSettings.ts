import mongoose, { Document, Schema } from 'mongoose';

export interface IHospitalSettings extends Document {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  fiscalYearStart: number;
  currency: string;
  taxSettings: {
    corporateTaxRate: number;
    vatRate: number;
    withholdingTaxRate: number;
    deductionTypes: string[];
  };
  reportingSettings: {
    autoApproval: boolean;
    requireDualApproval: boolean;
    archiveAfterMonths: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    reminderDays: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSettingsSchema = new Schema<IHospitalSettings>({
  hospitalId: {
    type: String,
    required: [true, 'Hospital ID is required'],
    unique: true,
    trim: true
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [200, 'Hospital name cannot exceed 200 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true
  },
  fiscalYearStart: {
    type: Number,
    required: [true, 'Fiscal year start is required'],
    min: [1, 'Fiscal year start must be between 1 and 12'],
    max: [12, 'Fiscal year start must be between 1 and 12']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: ['IDR', 'USD'],
    default: 'IDR'
  },
  taxSettings: {
    corporateTaxRate: {
      type: Number,
      required: [true, 'Corporate tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [1, 'Tax rate cannot exceed 100%'],
      default: 0.25
    },
    vatRate: {
      type: Number,
      required: [true, 'VAT rate is required'],
      min: [0, 'VAT rate cannot be negative'],
      max: [1, 'VAT rate cannot exceed 100%'],
      default: 0.11
    },
    withholdingTaxRate: {
      type: Number,
      required: [true, 'Withholding tax rate is required'],
      min: [0, 'Withholding tax rate cannot be negative'],
      max: [1, 'Withholding tax rate cannot exceed 100%'],
      default: 0.02
    },
    deductionTypes: [{
      type: String,
      trim: true
    }]
  },
  reportingSettings: {
    autoApproval: {
      type: Boolean,
      default: false
    },
    requireDualApproval: {
      type: Boolean,
      default: true
    },
    archiveAfterMonths: {
      type: Number,
      min: [1, 'Archive period must be at least 1 month'],
      max: [120, 'Archive period cannot exceed 120 months'],
      default: 24
    }
  },
  notificationSettings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    reminderDays: [{
      type: Number,
      min: [1, 'Reminder days must be positive']
    }]
  }
}, {
  timestamps: true
});

// Index
HospitalSettingsSchema.index({ hospitalId: 1 });

export default mongoose.models.HospitalSettings || mongoose.model<IHospitalSettings>('HospitalSettings', HospitalSettingsSchema);