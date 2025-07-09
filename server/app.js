// server/app.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // ✅ Load .env only once, and at the top

const app = express();

// ✅ Allow both local and Vercel frontends
const allowedOrigins = [
  'http://localhost:5173',
  'https://week-5-web-sockets-assignment-felix.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

// 🛠 Optional: Log request origins (useful for debugging)
app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  next();
});

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Chat API Server');
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
