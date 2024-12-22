import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db';
import seedAdmin from './app';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//connect to database and seed admin account
connectDB();
seedAdmin();

app.use(express.json());

//Routes
app.use('api/auth', require('./routes/authRoutes'));
app.use('api/quiz', require('./routes/quizRoutes'));

app.listen(PORT, () =>  console.log(`Server running on port ${PORT}`));