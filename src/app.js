const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const { authorize } = require("./middleware/roleMiddleware");
const productRoutes = require("./routes/productRoutes");
const passport = require("./config/passport");
const offerRoutes = require("./routes/offerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
 app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
 }));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use(passport.initialize());
app.use("/api/offers", offerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

 app.get("/", (req, res) => {
    res.send("API is Running");
 });
 app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "You accessed protected route!", user: req.user });
});
app.post("/admin-only", protect, authorize("admin"), (req, res) => {
   res.json({ message: "Admin access granted", user: req.user });
});

 module.exports = app;