const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');

// register
const signup = async (req, res) => {
  try {
    console.log("signup route hit")
    const { username, password,email } = req.body;
    const user = new User({ username, password ,email });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    // await user.save();
    await user.save();
    res.status(201).json({ message: 'User created successfully',refreshToken,accessToken });
  } catch (error) {
    res.status(400).json({ message: 'Signup failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(403).json({ message: 'Refresh token required' });

    const user = await User.findOne({ refreshToken: token });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(payload.userId);
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Token refresh failed', error: error.message });
  }
};

// Controller to get the logged-in user's profile
const getUserProfile = async (req, res) => {
  try {
    // The user ID is attached to the request object by the authenticateUser middleware
    const user = await User.findById(req.userId).select('-password'); // Exclude password field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// Controller to get all users
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId; // Assuming req.user contains the authenticated user's info
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password'); // Exclude password from response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

module.exports = { signup, login, refreshToken ,getUserProfile,getAllUsers};
