const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require("path");
const authRouter = require('./routes/authRoutes');
const doctorRouter = require('./routes/doctorRoutes');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const notifyRouter = require('./routes/notificationRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json()); // to parse JSON request bodies
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/notifications', notifyRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

//Need to Remove 
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working" });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "Pong! Server is working" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Health Assistant API");
});


module.exports = app;