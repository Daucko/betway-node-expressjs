require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Cross Origin Resource Sharing
app.use(cors());

// Built-in middleware for json
app.use(express.json());

app.get('/', (req, res) => {
  console.log('✅ - Hitting GET method!');
  res.sendStatus(200);
});

app.use('/auth', require('./routes/auth'));

mongoose.connection.once('open', () => {
  console.log('Connected to MongDB...');
  app.listen(PORT, () => console.log(`🚀 Server listing on port ${PORT}`));
});
