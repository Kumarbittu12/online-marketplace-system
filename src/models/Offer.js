// const mongoose = require("mongoose");

// const offerSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true
//   },
//   seller: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   price: { type: Number, required: true },
//   stock: { type: Number, required: true },
//   discount: { type: Number, default: 0 }
// }, { timestamps: true });

// module.exports = mongoose.model("Offer", offerSchema);
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  discount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
