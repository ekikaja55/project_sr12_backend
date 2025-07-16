import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Users from './models/Users.js';
// import pengeluaranRoutes from './routes/pengeluaran.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/pengeluaran', pengeluaranRoutes);

app.get('/', async (req, res) => {
    try {
        return res.status(200).json({
            message: "Welcome to the API"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Terjadi kesalahan",
            error: error.message
        });
    }
});

// Dummy login endpoint (sementara)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: "Username dan password harus diisi"
        });
    }
    try {
        const data = await Users.findOne({ username, password });
        console.log(data);
        if (!data) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }
        return res.status(200).json({
            message: "Berhasil mendapatkan data",
            data: data
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Terjadi kesalahan saat mendapatkan data",
            error: error.message
        });
    }

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
