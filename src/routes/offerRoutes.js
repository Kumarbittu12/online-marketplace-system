const express = require("express");
const { createOffer } = require("../controllers/offerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("seller"), createOffer);

module.exports = router;
