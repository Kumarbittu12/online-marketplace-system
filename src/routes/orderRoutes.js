const express = require("express");
// const { checkout, getMyOrders } = require("../controllers/orderController");
// const { updateOrderStatus } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  checkout,
  getMyOrders,
  updateOrderStatus,
  requestReturn,
  approveReturn,
  processRefund
} = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", protect, checkout);
router.post("/update-status", protect, authorize("admin", "seller"), updateOrderStatus);

router.post("/request-return", protect, requestReturn);



router.post("/approve-return",protect,authorize("admin"),approveReturn);

router.post("/refund",protect,authorize("admin"),processRefund);
router.get("/my-orders", protect, getMyOrders);

module.exports = router;