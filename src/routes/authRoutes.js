const express = require("express");
const { register, login, refreshToken } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

router.post("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

module.exports = router;
