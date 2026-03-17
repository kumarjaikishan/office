// models/payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },

  orderId: String,
  paymentId: String,

  amount: Number,
  currency: {
    type: String,
    default: "INR",
  },

  status: {
    type: String,
    enum: ["CREATED", "SUCCESS", "FAILED"],
    default: "CREATED",
  },

  method: String, // card, upi, netbanking

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);