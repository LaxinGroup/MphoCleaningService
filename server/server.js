import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Sample API Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'Server is running perfectly' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
