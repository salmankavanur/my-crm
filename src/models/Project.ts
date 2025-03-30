// src/models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from './Customer';
import { IBranch } from './Branch';

interface Milestone {
  title: string;
  description?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  order: number;
}

interface Attachment {
  name: string;
  fileUrl: string;
  uploadedAt: Date;
  type: string;
}

export interface IProject extends Document {
  title: string;
  description: string;
  customer: mongoose.Types.ObjectId | ICustomer;
  branch: mongoose.Types.ObjectId | IBranch;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  milestones: Milestone[];
  budget?: number;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  team?: mongoose.Types.ObjectId[];
  attachments?: Attachment[];
  tags?: string[];
  isVisible: boolean; // Whether visible to customer in portal
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { 
      type: String, 
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning'
    },
    milestones: [{
      title: { type: String, required: true },
      description: { type: String },
      dueDate: { type: Date },
      completedDate: { type: Date },
      status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed', 'delayed'],
        default: 'pending'
      },
      order: { type: Number, required: true }
    }],
    budget: { type: Number },
    currency: {
      code: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true }
    },
    team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    attachments: [{
      name: { type: String, required: true },
      fileUrl: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
      type: { type: String }
    }],
    tags: [{ type: String }],
    isVisible: { type: Boolean, default: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);