require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const allowedOrigins = require('./config/allowedOrigins');
const Routes = require('./routes/index');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Built-in middleware for json
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: '✅ Welcome to betwise API!' });
});

// Routes
app.use('/api', Routes);

app.all(/.*/, (req, res) => {
  res.status(404).json({ error: '404 Not Found' });
  console.log(`❌ - ${req.method} ${req.originalUrl} not found`);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongDB...');
  app.listen(PORT, () => console.log(`🚀 Server listing on port ${PORT}`));
});
