const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require("path");
const authRouter = require('./routes/authRoutes');
const doctorRouter = require('./routes/doctorRoutes');
const adminRouter = require('./routes/adminRoutes');


dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json()); // to parse JSON request bodies
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/admin', adminRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Health Assistant API");
});

module.exports = app;