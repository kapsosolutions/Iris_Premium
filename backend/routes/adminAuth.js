import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { generateCsrfToken, verifyCsrfToken } from '../middleware/csrfMiddleware.js';

dotenv.config();
const router = express.Router();

/** POST /api/admin/login — Login with credentials (user: admin, pass: admin) */
router.post('/login', generateCsrfToken, (req, res) => {
  const { username, password } = req.body;

  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'admin';

  if (username !== validUser || password !== validPass) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET || 'iris_jwt_secret_key_2026_super_secure',
    { expiresIn: '24h' }
  );

  res.cookie('adminToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });

  const csrfToken = req.cookies?.csrfToken || 'iris_csrf_token_active';

  res.json({
    success: true,
    message: 'Admin login successful',
    token,
    csrfToken,
    user: { username, role: 'admin' }
  });
});

/** GET /api/admin/me — Session check */
router.get('/me', (req, res) => {
  const token = req.cookies?.adminToken || req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iris_jwt_secret_key_2026_super_secure');
    res.json({ success: true, user: decoded, csrfToken: req.cookies?.csrfToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session expired' });
  }
});

/** POST /api/admin/logout — Logout */
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.clearCookie('csrfToken');
  res.json({ success: true, message: 'Admin logged out' });
});

export default router;
