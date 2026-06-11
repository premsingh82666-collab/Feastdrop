const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = 'feastdrop_secret_2024';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const OrderSchema = new mongoose.Schema({
  userId: String,
  cart: Array,
  total: Number,
  address: String,
  status: {
    type: String,
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email
      },
      SECRET
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: 'Wrong password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email
      },
      SECRET
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { cart, total, address, userId } = req.body;

    const order = await Order.create({
      cart,
      total,
      address,
      userId
    });

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.params.userId
    });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
