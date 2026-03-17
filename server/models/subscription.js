// models/subscription.js

const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  plan: {
    type: String,
    enum: ["STARTUP", "PRO", "ENTERPRISE"],
    required: true,
  },

  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
    default: "PENDING",
  },

  amount: {
    type: Number, // in paise
    required: true,
  },

  currency: {
    type: String,
    default: "INR",
  },
  conf_type: {
    type: String,
    enum: ["FRONTEND", "WEBHOOK", "NODECRON", "NOT_CONFIRMED"],
    default: "NOT_CONFIRMED",
  },
  orderId: {
    type: String, // Razorpay order_id
  },

  paymentId: {
    type: String, // Razorpay payment_id
  },

  startDate: {
    type: Date,
  },

  endDate: {
    type: Date,
  },

  durationInDays: {
    type: Number,
    default: 30,
  },

  autoRenew: {
    type: Boolean,
    default: false,
  },

  metadata: {
    type: Object, // for future (features, limits, etc.)
  },

}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);