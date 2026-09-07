import crypto from 'crypto';

// Simple lightweight CSRF token generator & middleware for admin state security
export const generateCsrfToken = (req, res, next) => {
  if (!req.cookies?.csrfToken) {
    const csrfToken = crypto.randomBytes(24).toString('hex');
    res.cookie('csrfToken', csrfToken, { httpOnly: false, secure: false, sameSite: 'lax' });
  }
  next();
};

export const verifyCsrfToken = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, message: 'CSRF token mismatch or missing' });
  }
  next();
};

export default { generateCsrfToken, verifyCsrfToken };
