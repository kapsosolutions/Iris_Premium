import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, default: 'admin' },
  password: { type: String, required: true, default: 'admin' },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
