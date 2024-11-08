const { verifyToken } = require('../utils/tokenUtils');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  // console.log(token)
  if (!token) return res.status(403).json({ message: 'Token required' });

  try {
    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
    req.userId = payload.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = authMiddleware;
