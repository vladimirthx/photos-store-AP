const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'A token is required for authentication' });
  }

  try {
    const bearer = token.split(' ')[1]; // "Bearer <token>"
    const decoded = jwt.verify(bearer || token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
  return next();
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privileges required' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};
