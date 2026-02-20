const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true
  },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [orderItemSchema],

  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,

  status: {
  type: String,
  enum: [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "return_requested",
    "returned",
    "refunded",
    "cancelled"
  ],
  default: "pending"
}

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);