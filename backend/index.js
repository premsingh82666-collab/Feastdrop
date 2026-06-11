const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'feastdrop_secret_2024';
const db = new Low(new JSONFile('db.json'), { users: [], orders: [] });

async function initDB() {
  await db.read();
  db.data ||= { users: [], orders: [] };
  await db.write();
}
initDB();

app.post('/api/register', async (req, res) => {
  await db.read();
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const exists = db.data.users.find(u => u.email === email);
  if (exists) return res.status(400).json({ error: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email, password: hashed };
  db.data.users.push(user);
  await db.write();
  const token = jwt.sign({ id: user.id, name, email }, SECRET);
  res.json({ token, user: { id: user.id, name, email } });
});

app.post('/api/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Wrong password' });
  const token = jwt.sign({ id: user.id, name: user.name, email }, SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email } });
});

app.post('/api/orders', async (req, res) => {
  await db.read();
  const { cart, total, address, userId } = req.body;
  const order = { id: Date.now(), userId, cart, total, address, status: 'confirmed', createdAt: new Date().toISOString() };
  db.data.orders.push(order);
  await db.write();
  res.json({ success: true, order });
});

app.get('/api/orders/:userId', async (req, res) => {
  await db.read();
  const orders = db.data.orders.filter(o => String(o.userId) === String(req.params.userId));
  res.json(orders);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
