import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import wallRoutes from './routes/wall';
import path from 'path';
import authRoutes from './routes/auth';  
import adminRoutes from './routes/admins'; 
import cartRoutes    from './routes/cart';
import orderRoutes   from './routes/orders';    

dotenv.config();


const app = express();
app.use(express.json());


// serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
  
// Auth endpoints (signup, login)
app.use('/api/auth', authRoutes);

app.use('/api/admins', adminRoutes);

app.use('/api/products', productRoutes);
app.use('/api/wall', wallRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/orders',    orderRoutes);


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));