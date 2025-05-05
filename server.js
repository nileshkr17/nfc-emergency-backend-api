const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const profileRoutes = require('./routes/profile');
const otpRoutes = require('./routes/otp');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/profile', profileRoutes);
app.use('/api/otp', otpRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(5000, () => console.log('Server running on port 5000'));
}).catch(err => console.error(err));
