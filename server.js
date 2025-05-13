require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const verifyJWT = require('./middleware/verifyJWT');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://mindful-task-manager-app.lovable.app',
      'https://your-production-domain.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Built-in middleware for json
app.use(express.json());

app.get('/', (req, res) => {
  console.log('✅ - Hitting GET method!');
  res.sendStatus(200);
});

// Routes
app.use('/auth', require('./routes/auth'));

app.use(verifyJWT);
app.use('/games', require('./routes/games'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongDB...');
  app.listen(PORT, () => console.log(`🚀 Server listing on port ${PORT}`));
});
