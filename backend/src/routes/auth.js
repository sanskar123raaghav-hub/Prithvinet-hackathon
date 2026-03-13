const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// In-memory user store (replace with PostgreSQL in production)
const users = [
  {
    id: 1,
    email: "admin@prithvinet.gov",
    password: "$2a$10$X7UrE2e5G6F7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6", // "admin123"
    role: "admin",
    name: "System Administrator",
  },
];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: "operator",
      name: name || email.split("@")[0],
    };
    users.push(newUser);

    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
});

module.exports = router;
