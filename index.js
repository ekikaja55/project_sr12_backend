import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


import Users from './models/Users.js';
// import pengeluaranRoutes from './routes/pengeluaran.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Ganti sesuai domain frontend
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/pengeluaran', pengeluaranRoutes);

app.get('/api', (req, res) => {
    // console.log(crypto.randomUUID());
    
    const token = req.cookies.token;
    if (token !== process.env.TOKEN) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ message: "Welcome to the API" });
});


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password harus diisi" });
    }

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {

        // Set cookie ke browser
        res.cookie('token', process.env.TOKEN, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 hari
            secure: process.env.NODE_ENV === 'production', // ✅ ini udah bagus
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // ✅ tambahkan ini
        });

        return res.status(200).json({ message: "Login berhasil", username });
    }

    return res.status(401).json({ message: "Login gagal" });
});

app.post('/api/logout', (req, res) => {
    console.log("masuk");
    
    if (!req.cookies.token) {
        return res.status(400).json({ message: "Tidak ada token untuk dihapus" });
    }
    res.clearCookie('token');
    return res.status(200).json({ message: "Logout berhasil" });
});


const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
};

start();
