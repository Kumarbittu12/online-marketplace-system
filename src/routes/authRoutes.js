const express = require("express");
const { register, login, refreshToken } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const passport = require("passport");
const { generateAccessToken, generateRefreshToken } = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/authController");




const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});


// Start Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    // redirect or respond
    res.json({
      accessToken,
      role: user.role,
      userId: user._id,
    });
  }
);

module.exports = router;
