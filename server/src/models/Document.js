import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    type: { type: String, trim: true },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
    expense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense', index: true },
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
