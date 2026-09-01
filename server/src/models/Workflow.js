import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    assignedRole: { type: String },
  },
  { _id: true }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    steps: [stepSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Workflow = mongoose.model('Workflow', workflowSchema);
