import express from 'express';
import { upload } from '../services/upload';
const router = express.Router();

router.post('/upload', upload.single('wallImage'), (req, res) => {
  if (!req.file) return res.status(400).send('Image required');
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url, filename: req.file.filename });
});

export default router;