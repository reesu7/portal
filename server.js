import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer'; 
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url'; 
import User from  "./model/model.js"; 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const app = express();
mongoose.connect('mongodb+srv://bizpost25:c0v8Dg9VPe9PccKm@cluster0.tgxtxlp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const uploadDir = path.join(__dirname, 'uploads'); 
let errorCount = 0;
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + fileExtension);
    }
});
app.use('/uploads', express.static('uploads'));
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            errorCount++; 
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.'));
        }
    }
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/admin/add', upload.single('cv'), async (req, res) => {
    try {
        const { name, job } = req.body;
        const imagePath = req.file.filename;
        const newUser = new User({
            name: name,
            jobType: job,
            imagePath: imagePath
        });
        await newUser.save();
        res.redirect('/index.html'); 
    } catch (error) {
        console.error('Error adding user:', error);
        errorCount++; 
        res.status(500).json({ error: error.message });
    }
});


app.get('/users/:jobType', async (req, res) => {
    try {
        const jobType = req.params.jobType;
        const users = await User.find({ jobType: jobType });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        errorCount++; 
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
