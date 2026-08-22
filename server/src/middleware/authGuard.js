const jwt = require('jsonwebtoken');

function authGuard(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
    });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}

// Same as authGuard, but doesn't fail if no token is present — used on
// routes that behave differently for logged-in vs anonymous users
// (e.g. public trip view + copy button visibility).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.sub;
    } catch (err) {
      // ignore invalid token on optional routes
    }
  }
  next();
}

module.exports = { authGuard, optionalAuth };
