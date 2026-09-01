import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, DEPARTMENTS } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.ACCOUNTANT, required: true, index: true },
    department: { type: String, enum: DEPARTMENTS },
    avatar: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
