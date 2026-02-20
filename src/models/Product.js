// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     stock: {
//       type: Number,
//       required: true,
//     },
//     category: {
//       type: String,
//       required: true,
//     },
//     brand: String,
//     images: [String],
//     specs: Object,
//     isActive: { type: Boolean, default: true },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [String],
  category: { type: String, required: true },
  brand: String,
  specs: Object,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

module.exports = mongoose.model("Product", productSchema);
