import mongoose from 'mongoose';
import crypto from 'crypto';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Store the SHA-256 hash of the token (not the raw token). The raw token
    // only ever leaves the database via the email link, so a DB leak does not
    // allow attackers to reset arbitrary accounts.
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    // Soft throttle: when the same user requests a reset again we mark the
    // previous unused tokens as superseded so they can no longer be used.
    superseded: { type: Boolean, default: false },
    requestIp: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
);

passwordResetTokenSchema.index({ expiresAt: 1, usedAt: 1 }, { expireAfterSeconds: 0 });

passwordResetTokenSchema.statics.hashToken = function (rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

passwordResetTokenSchema.statics.createForUser = async function (userId, { ip, userAgent } = {}) {
  // Invalidate any outstanding tokens for this user.
  await this.updateMany(
    { user: userId, usedAt: { $exists: false }, superseded: false },
    { $set: { superseded: true } },
  );

  const rawToken = crypto.randomBytes(32).toString('hex'); // 64-char URL-safe
  const tokenHash = this.hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await this.create({ user: userId, tokenHash, expiresAt, requestIp: ip, userAgent });
  return rawToken;
};

passwordResetTokenSchema.statics.consume = async function (rawToken) {
  if (!rawToken) return null;
  const tokenHash = this.hashToken(rawToken);
  const record = await this.findOne({ tokenHash });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.superseded) return null;
  if (record.expiresAt < new Date()) return null;
  record.usedAt = new Date();
  await record.save();
  return record;
};

export const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  passwordResetTokenSchema,
);
