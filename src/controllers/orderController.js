const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Offer = require("../models/Offer");

exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Reduce stock safely
    for (const item of cart.items) {
      const offer = await Offer.findById(item.offer);

      if (offer.stock < item.quantity) {
        return res.status(400).json({ message: "Stock changed, try again" });
      }

      offer.stock -= item.quantity;
      await offer.save();
    }

    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        offer: item.offer,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtTime
      })),
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total
    });

    // Clear cart after checkout
    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: "items.offer",
        populate: { path: "product seller" }
      });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const allowed = ["paid", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestReturn = async (req, res) => {
  const { orderId, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "delivered") {
    return res.status(400).json({ message: "Return only allowed after delivery" });
  }

  order.status = "return_requested";
  order.returnReason = reason;

  await order.save();

  res.json({ message: "Return request submitted", order });
};

// Admin/Seller can approve or reject return requests

exports.approveReturn = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "return_requested") {
    return res.status(400).json({ message: "Invalid return state" });
  }

  order.status = "returned";

  // restore stock
  for (const item of order.items) {
    const offer = await Offer.findById(item.offer);
    offer.stock += item.quantity;
    await offer.save();
  }

  await order.save();

  res.json({ message: "Return approved & stock restored", order });
};

//
exports.processRefund = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "returned") {
    return res.status(400).json({ message: "Refund not allowed yet" });
  }

  order.status = "refunded";
  await order.save();

  res.json({ message: "Refund completed", order });
};