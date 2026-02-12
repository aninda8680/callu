import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  avatarConfig: {
    type: Object, // Store avatar configuration (color, generic id)
    default: {} 
  }
}, { timestamps: true });

const User = models.User || model('User', UserSchema);

export default User;
