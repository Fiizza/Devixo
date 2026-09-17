import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel } from "../models/userModel.js";
import { sendVerificationEmail } from "../config/mailer.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Please enter a valid email address" });
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + TOKEN_TTL_MS);
    const user = await UserModel.create({ name, email, hashedPassword, verificationToken, verificationExpires });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr.message);
    }

    res.status(201).json({ message: "Account created. Please check your email to verify your account.", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Verification token missing" });
    const user = await UserModel.findByVerificationToken(token);
    if (!user) return res.status(400).json({ message: "Invalid or expired verification link" });
    if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({ message: "Verification link has expired. Please request a new one." });
    }
    const verifiedUser = await UserModel.markVerified(user.id);
    const jwtToken = generateToken(verifiedUser.id);
    res.json({ message: "Email verified successfully", user: verifiedUser, token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during verification" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await UserModel.findByEmail(email);
    if (!user) return res.json({ message: "If that account exists, a new verification email has been sent." });
    if (user.is_verified) return res.json({ message: "This account is already verified. Please log in." });
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + TOKEN_TTL_MS);
    await UserModel.setVerificationToken(user.id, verificationToken, verificationExpires);
    await sendVerificationEmail(email, verificationToken);
    res.json({ message: "If that account exists, a new verification email has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error resending verification email" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.is_verified) return res.status(403).json({ message: "Please verify your email before logging in.", needsVerification: true });
    const token = generateToken(user.id);
    delete user.password;
    delete user.verification_token;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req, res) => {
  const user = await UserModel.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
};
