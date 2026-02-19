const Cart = require("../models/Cart");
const Offer = require("../models/Offer");

const calculateTotals = (cart) => {
  cart.subtotal = cart.items.reduce(
    (sum, item) => sum + item.priceAtTime * item.quantity,
    0
  );

  cart.tax = cart.subtotal * 0.05; // 5% tax example
  cart.shipping = cart.subtotal > 1000 ? 0 : 50; // free over 1000
  cart.total = cart.subtotal + cart.tax + cart.shipping;
};

// ➕ ADD / UPDATE ITEM
exports.addToCart = async (req, res) => {
  try {
    const { offerId, quantity } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer || offer.stock < quantity) {
      return res.status(400).json({ message: "Offer unavailable or low stock" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{
          offer: offerId,
          quantity,
          priceAtTime: offer.price
        }]
      });
    } else {
      const existing = cart.items.find(
        item => item.offer.toString() === offerId
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({
          offer: offerId,
          quantity,
          priceAtTime: offer.price
        });
      }
    }

    calculateTotals(cart);
    await cart.save();

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// ➖ REMOVE ITEM
exports.removeFromCart = async (req, res) => {
  try {
    const { offerId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.offer.toString() !== offerId
    );

    calculateTotals(cart);
    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📦 GET CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: "items.offer",
        populate: { path: "product seller" }
      });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
