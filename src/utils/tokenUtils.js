const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const generateFirebaseToken = async (userId) => {
  try {
    // Generate the Firebase custom token for the given userId
    const firebaseToken = await admin.auth().createCustomToken(userId.toString());
    return firebaseToken;
  } catch (error) {
    console.error("Error generating Firebase token:", error.message);
    throw new Error("Unable to generate Firebase token.");
  }
};


module.exports = { generateAccessToken, generateRefreshToken, verifyToken, generateFirebaseToken };
