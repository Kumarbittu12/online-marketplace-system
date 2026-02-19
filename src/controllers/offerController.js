const Offer = require("../models/Offer");

exports.createOffer = async (req, res) => {
  try {
    const { productId, price, stock, discount } = req.body;

    if (!productId || !price || !stock) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const offer = await Offer.create({
      product: productId,
      seller: req.user.id,
      price,
      stock,
      discount
    });

    res.status(201).json(offer);
  } catch (error) {
  console.error("CREATE OFFER ERROR:", error);
  res.status(500).json({ error: error.message });
}

};
