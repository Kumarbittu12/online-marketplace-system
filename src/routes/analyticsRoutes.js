const express = require("express");
const {
  salesAnalytics,
  userAnalytics,
  inventoryAnalytics
} = require("../controllers/analyticsController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", protect, authorize("admin"), salesAnalytics);
router.get("/users", protect, authorize("admin"), userAnalytics);
router.get("/inventory", protect, authorize("admin"), inventoryAnalytics);

module.exports = router;