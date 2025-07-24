import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';
import { Types } from 'mongoose';

const router = express.Router();

// — Create new admin (only by admin)
router.post(
  '/', 
  requireAuth('admin'),
  async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({ name, email, password: hashed, role: 'admin' });
    res.status(201).json({
      id:    newAdmin._id,
      name:  newAdmin.name,
      email: newAdmin.email,
      role:  newAdmin.role,
    });
  }
);

// — List all users
router.get(
  '/users',
  requireAuth('admin'),
  async (req, res) => {
    const users = await User.find()
      .select('_id name email role')
      .lean();
    res.json(users.map(u => ({
      id:    u._id,
      name:  u.name,
      email: u.email,
      role:  u.role,
    })));
  }
);

// — Get single user
router.get(
  '/users/:id',
  requireAuth('admin'),
  async (req, res) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(id).select('_id name email role');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    });
  }
);

// — Update user role
router.patch(
  '/users/:id/role',
  requireAuth('admin'),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body as { role: 'admin' | 'seller' | 'customer' };
    if (!Types.ObjectId.isValid(id) || !['admin','seller','customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  }
);

// — Delete a user
router.delete(
  '/users/:id',
  requireAuth('admin'),
  async (req, res) => {
    console.log('[ADMINS][DELETE_USER] Attempting to delete user');
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.deleteOne();
    res.status(204).send();
  }
);

export default router;
