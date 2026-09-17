import { UserModel } from "../models/userModel.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar_url } = req.body;
    const user = await UserModel.updateProfile(req.userId, { name, avatar_url });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
