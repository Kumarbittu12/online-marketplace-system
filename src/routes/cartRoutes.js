const express = require("express");
const {
  addToCart,
  removeFromCart,
  getCart
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addToCart);
router.post("/remove", protect, removeFromCart);
router.get("/", protect, getCart);

module.exports = router;
