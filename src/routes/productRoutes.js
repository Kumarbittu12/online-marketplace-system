const express = require("express");
const { createProduct, getProducts } = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("admin", "seller"), createProduct);
router.get("/", getProducts);

module.exports = router;
