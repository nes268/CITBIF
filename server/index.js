import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citbif';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);
const User = mongoose.model('User', userSchema);

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, username, password, role } = req.body;

    // Validation
    if (!fullName || !email || !username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Invalid role. Must be admin or user' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email or username already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingAdmin || existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Create user based on role
    let newUser;
    if (role === 'admin') {
      newUser = new Admin({
        fullName,
        email,
        username,
        password: hashedPassword,
        profileComplete: false
      });
      await newUser.save();
    } else {
      newUser = new User({
        fullName,
        email,
        username,
        password: hashedPassword,
        profileComplete: false
      });
      await newUser.save();
    }

    // Return user data (without password)
    const userResponse = {
      id: newUser._id.toString(),
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
      role: role,
      profileComplete: newUser.profileComplete,
      createdAt: newUser.createdAt.toISOString()
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Validation
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Try to find user in Admin collection first
    let foundUser = await Admin.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    let userRole = 'admin';

    // If not found in Admin, try User collection
    if (!foundUser) {
      foundUser = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
      });
      userRole = 'user';
    }

    // If user not found in either collection
    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username/password' });
    }

    // Return user data (without password)
    const userResponse = {
      id: foundUser._id.toString(),
      fullName: foundUser.fullName,
      email: foundUser.email,
      username: foundUser.username,
      role: userRole,
      profileComplete: foundUser.profileComplete,
      createdAt: foundUser.createdAt.toISOString()
    };

    res.status(200).json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

