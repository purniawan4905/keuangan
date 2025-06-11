import mongoose, { Document, Schema } from 'mongoose';

export interface IReviewSchedule extends Document {
  _id: string;
  reportId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  reviewType: 'monthly' | 'quarterly' | 'annual' | 'audit';
  assignedTo: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewScheduleSchema = new Schema<IReviewSchedule>({
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'FinancialReport',
    required: [true, 'Report ID is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  reviewType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'audit'],
    required: [true, 'Review type is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned to is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
ReviewScheduleSchema.index({ assignedTo: 1, status: 1 });
ReviewScheduleSchema.index({ scheduledDate: 1 });
ReviewScheduleSchema.index({ reportId: 1 });

export default mongoose.models.ReviewSchedule || mongoose.model<IReviewSchedule>('ReviewSchedule', ReviewScheduleSchema);