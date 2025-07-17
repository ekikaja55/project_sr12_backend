// index.js
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Hanya load dotenv saat di mode development
if (process.env.NODE_ENV !== 'production') {
	import('dotenv').then(dotenv => dotenv.config());
}

const app = express();

// Konfigurasi CORS
app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Route test
app.get('/api', (req, res) => {
	const token = req.cookies.token;
	if (token !== process.env.TOKEN) {
		return res.status(401).json({ message: "Unauthorized" });
	}
	return res.status(200).json({ message: "Welcome to the API" });
});

// Login
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ message: "Username dan password harus diisi" });
	}

	if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
		res.cookie('token', process.env.TOKEN, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
		});
		return res.status(200).json({ message: "Login berhasil", username });
	}

	return res.status(401).json({ message: "Login gagal" });
});

// Logout
app.post('/api/logout', (req, res) => {
	if (!req.cookies.token) {
		return res.status(400).json({ message: "Tidak ada token untuk dihapus" });
	}
	res.clearCookie('token', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
	});
	return res.status(200).json({ message: "Logout berhasil" });
});

// Start server
const start = async () => {
	try {
		if (!process.env.MONGO_URI) {
			throw new Error('MONGO_URI tidak ditemukan di environment variables');
		}

		await mongoose.connect(process.env.MONGO_URI);
		console.log('✅ MongoDB connected');

		const PORT = process.env.PORT || 3000;
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error('❌ Error saat menghubungkan ke MongoDB:', err.message);
		process.exit(1);
	}
};

start();
