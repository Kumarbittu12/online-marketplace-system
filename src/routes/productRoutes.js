const express = require("express");
const { createProduct, getProducts ,getMarketplaceProducts} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// router.post("/", protect, authorize("admin", "seller"), createProduct);
// router.get("/", getProducts);

//  router.post("/", protect, authorize("admin"), createProduct);
 router.post("/", protect, authorize("admin"), createProduct);

router.get("/", getProducts);
router.get("/marketplace", getMarketplaceProducts);

module.exports = router;
