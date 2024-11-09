const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken, generateFirebaseToken } = require('../utils/tokenUtils');

// Signup controller
const signup = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const firebaseToken = await generateFirebaseToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({ message: 'User created', accessToken, refreshToken, firebaseToken });
  } catch (error) {
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const firebaseToken = await generateFirebaseToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken, firebaseToken });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId;
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

module.exports = { signup, login, getUserProfile, getAllUsers };
