import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { sendWelcomeEmail } from "../services/notificationService.js";
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, hostel, hostels, block, room } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userData = {
      name,
      email,
      password,
      role,
      block,
      room
    };

    // ✅ Role-based field handling
    if (role === "STUDENT") {
      userData.hostel = hostel;
    } else {
      userData.hostels = hostels;
    }

    const user = await User.create(userData);

    // Send welcome email (async, don't wait for it)
    sendWelcomeEmail(user).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        hostels: user.hostels
      }
    });
  } catch (err) {
    next(err);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        hostel: user.hostel,
        block: user.block,
        room: user.room,
        hostels: user.hostels
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { phone, name, email } = req.body;
    const userId = req.user._id;

    console.log('Updating profile for user:', userId);
    console.log('Request body:', req.body);

    // Only allow updating phone number for now
    const updateData = {};
    if (phone !== undefined) {
      updateData.phone = phone.trim();
      console.log('Setting phone to:', updateData.phone);
    }
    // TODO: Add admin validation for name/email updates if needed

    console.log('Update data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('Updated user:', updatedUser);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.toLowerCase(),
        hostel: updatedUser.hostel,
        block: updatedUser.block,
        room: updatedUser.room,
        phone: updatedUser.phone,
        hostels: updatedUser.hostels
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    next(err);
  }
};

export const me = (req, res) => {
  const { _id, name, email, role, hostel, block, room, hostels, phone } = req.user;
  console.log('ME function - user phone:', phone);
  res.json({
    user: {
      id: _id,
      name,
      email,
      role: role.toLowerCase(),
      hostel,
      block,
      room,
      phone,
      hostels
    }
  });
};
