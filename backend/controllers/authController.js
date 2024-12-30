import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["student", "teacher"].includes(role)) {
    return res.status(400).json({ message: "Invalid role selected" });
  }
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    // If the middleware passed, the token is valid
    res.status(200).json({ 
      message: "Token is valid",
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: "Token verification failed" });
  }
};
