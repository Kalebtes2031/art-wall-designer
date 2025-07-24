// backend/src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  console.log('[AUTH][LOGIN] incoming request:', req.body);
  try {
    const { email, password } = req.body;

    console.log('[AUTH][LOGIN] looking up user by email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.warn('[AUTH][LOGIN] no user found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[AUTH][LOGIN] comparing password for user:', user._id);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn('[AUTH][LOGIN] password mismatch for user:', user._id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AUTH][LOGIN] Missing JWT_SECRET in env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn: '1d' }
    );
    console.log('[AUTH][LOGIN] token generated for user:', user._id);

    res.json({ 
      token, 
      user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    } });
  } catch (err) {
    console.error('[AUTH][LOGIN] Unexpected error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});


// ─── SIGNUP ────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  console.log('[AUTH][SIGNUP] incoming request:', req.body);
  try {
    const { email, password, name } = req.body;

    console.log('[AUTH][SIGNUP] checking if user exists for email:', email);
    const existing = await User.findOne({ email });
    if (existing) {
      console.warn('[AUTH][SIGNUP] email already in use:', email);
      return res.status(400).json({ error: 'Email already in use' });
    }

    // console.log('[AUTH][SIGNUP] hashing password');
    // const hashed = await bcrypt.hash(password, 10);
    // console.log('[AUTH][SIGNUP] password hashed');

    console.log('[AUTH][SIGNUP] creating user document');
    const newUser = await User.create({
      name,
      email,
      password: password,
      role: 'customer',       // force customer
    });
    console.log('[AUTH][SIGNUP] user created with id:', newUser._id);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AUTH][SIGNUP] Missing JWT_SECRET in env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('[AUTH][SIGNUP] signing JWT');
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      secret,
      { expiresIn: '1d' }
    );
    console.log('[AUTH][SIGNUP] JWT signed for new user:', newUser._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
         name:  newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('[AUTH][SIGNUP] Unexpected error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});


// List all users (admin only)
router.get('/users', requireAuth('admin'), async (req, res) => {
  const all = await User.find().select('_id name email role').lean();
  // map _id to id
  const out = all.map(u => ({
    id:    u._id.toString(),
    name:  u.name,
    email: u.email,
    role:  u.role,
  }));
  res.json(out);
});





export default router;
