const Order = require("../models/Order");
const User = require("../models/User");
const Offer = require("../models/Offer");
const Product = require("../models/Product");


// 💰 SALES METRICS
exports.salesAnalytics = async (req, res) => {
  const totalRevenue = await Order.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } }
  ]);

  const dailySales = await Order.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    totalRevenue: totalRevenue[0]?.revenue || 0,
    totalOrders: totalRevenue[0]?.orders || 0,
    dailySales
  });
};


// 👥 USER METRICS
exports.userAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments();

  const newUsersToday = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0,0,0,0))
    }
  });

  res.json({ totalUsers, newUsersToday });
};


// 📦 INVENTORY METRICS
exports.inventoryAnalytics = async (req, res) => {
  const totalProducts = await Product.countDocuments();

  const lowStock = await Offer.find({ stock: { $lt: 5 } }).populate("product");

  const outOfStock = await Offer.find({ stock: 0 }).populate("product");

  res.json({
    totalProducts,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    lowStock,
    outOfStock
  });
};