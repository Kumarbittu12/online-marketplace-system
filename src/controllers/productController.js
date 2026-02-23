const Product = require("../models/Product");
const Offer = require("../models/Offer");
const redisClient = require("../config/redis");


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
  const cacheKey = "marketplace";

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("Marketplace from Redis");
    return res.json(JSON.parse(cached));
  }

  const products = await Product.find({ isActive: true });

  const results = await Promise.all(
    products.map(async product => {
      const offers = await Offer.find({ product: product._id, stock: { $gt: 0 } })
        .sort({ price: 1 })
        .limit(1);

      return { product, bestOffer: offers[0] || null };
    })
  );

  await redisClient.setEx(cacheKey, 60, JSON.stringify(results));

  res.json(results);
};

//
exports.searchProducts = async (req, res) => {
  try {
    const cacheKey = `search:${JSON.stringify(req.query)}`;

    // ⚡ check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Serving from Redis");
      return res.json(JSON.parse(cached));
    }

    // ===== MongoDB query (same as before) =====
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    let filter = { isActive: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    let offerFilter = {};
    if (minPrice || maxPrice) {
      offerFilter.price = {};
      if (minPrice) offerFilter.price.$gte = Number(minPrice);
      if (maxPrice) offerFilter.price.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit));

    const results = await Promise.all(
      products.map(async product => {
        const bestOffer = await Offer.findOne({
          product: product._id,
          ...offerFilter,
          stock: { $gt: 0 }
        }).sort({ price: 1 });

        return { product, bestOffer };
      })
    );

    // 🧊 Save to Redis (TTL 60 sec)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(results));

    res.json(results);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
