const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");


const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    user: user._id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // 👈 default user
    });

    res.status(201).json({
      message: "User registered successfully",
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({
      accessToken,
      role: user.role,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure we have the user's role when issuing a new access token
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) {
      // cleanup old token and respond
      await RefreshToken.deleteOne({ token });
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old token (rotation)
    await RefreshToken.deleteOne({ token });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh failed" });
  }
};

exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;

const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const crypto = require("crypto");

      const resetToken = crypto.randomBytes(32).toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

      await user.save();

      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <h2>Password Reset</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 15 minutes.</p>
        `
      });
    }

    res.json({
      message: "If the email exists, a reset link has been sent"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const crypto = require("crypto");

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Invalidate all sessions
    await RefreshToken.deleteMany({ user: user._id });

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
