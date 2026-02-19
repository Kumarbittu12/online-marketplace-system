const Product = require("../models/Product");
const Offer = require("../models/Offer");


// create and get products without auth for testing purposes
exports.createProduct = async (req, res) => {
  try {
    const { name, description, images, category, brand, specs } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const product = await Product.create({
      name,
      description,
      images,
      category,
      brand,
      specs
    });


    res.status(201).json(product);
  } catch (error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

};



exports.getMarketplaceProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    const results = await Promise.all(
      products.map(async product => {
        const offers = await Offer.find({ product: product._id, stock: { $gt: 0 } })
          .sort({ price: 1 })
          .limit(1);

        return {
          product,
          bestOffer: offers[0] || null
        };
      })
    );

    res.json(results);
  } catch (error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

};
