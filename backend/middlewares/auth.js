const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('[auth] Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[auth] ❌  Missing or malformed authorization token');
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[auth] Extracted token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('[auth] ✅ Extracted token (truncated):', token.slice(0, 10) + '...');
    req.user = { userId: decoded.id }; // or decoded.id depending on token structure
    next();
  } catch (err) {
    console.log('[auth] ❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
