const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
      maxlength: [20, 'Username cannot be more than 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    wallet: {
      balance: {
        type: Number,
        default: 1000, // Start with 1000 virtual coins
      },
      transactions: [
        {
          type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'bet', 'win'],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
          },
          description: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    refreshToken: String,
    _isAdmin: {
      type: Boolean,
      default: false,
    },
    _isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model('User', userSchema);
