const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      createdBy: req.user.id,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
