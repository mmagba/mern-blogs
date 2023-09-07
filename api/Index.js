const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');


require('dotenv').config();



const app = express();
const multer = require('multer');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const uploadMiddleware = multer({ dest: 'tmp/' });

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cors({ credentials: true, origin: 'https://mern-blogs-two.vercel.app' }));
app.use('/uploads', express.static(__dirname + '/uploads'));



const bucket = 'mmagba-mern-blogs';

async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
        region: 'eu-central-1',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
        }
    });
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFileName = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFileName,
        ContentType: mimetype,
        ACL: 'public-read',
    }));
    return `https://${bucket}.s3.amazonaws.com/${newFileName}`;
}

app.post('/api/register', async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    const { username, password } = req.body;
    try {
        const salt = bcrypt.genSaltSync(10);
        const userDoc = await User.create({ username, password: bcrypt.hashSync(password, salt) });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }

});

app.post('/api/login', async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    const { username, password } = req.body;
    const UserDoc = await User.findOne({ username });
    if (UserDoc === null || !bcrypt.compareSync(password, UserDoc.password)) {
        res.status(400).json('username or password are false!');
    } else {
        //logged in
        const token = await jwt.sign({ username, id: UserDoc.id }, process.env.SECRET_KEY);
        res.cookie('token', token).json({ username, id: UserDoc.id });
    }
});


app.get('/api/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401);
        }
        const info = await jwt.verify(token, process.env.SECRET_KEY);
        res.json(info);
    } catch (err) {
        console.error(err);
        res.status(500);
    }
});



app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json('logouted');
});


app.post('/api/post', uploadMiddleware.single('file'), async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    const { originalname, path, mimetype } = req.file;
    const imageURL = await uploadToS3(path, originalname, mimetype);
    const { token } = req.cookies;
    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: imageURL,
            author: info.id,
        });
        res.json(postDoc);
    });

});


app.put('/api/edit', uploadMiddleware.single('file'), async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    let imageURL = null;

    if (req.file) {
        const { originalname, path, mimetype } = req.file;
        imageURL = await uploadToS3(path, originalname, mimetype);
    }

    const { token } = req.cookies;
    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: imageURL ? imageURL : postDoc.cover,
        });

        res.json(postDoc);
    });
});

app.get('/api/blogs', async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    res.json(await Post.find().populate('author', ['username']).sort({ createdAt: -1 }));
});


app.get('/api/post/:id', async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    const idd = req.params.id;
    try {
        const postDoc = await Post.findById(idd).populate('author', ['username']);
        res.json(postDoc);
    } catch (err) {
        res.status(404);
    }
});


app.delete('/api/delete/:id', async (req, res) => {
    mongoose.connect(process.env.DB_URI);
    const idd = req.params.id;
    const { token } = req.cookies;
    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
        if (err) {
            return;
        }

        const postDoc = await Post.findById(idd);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        await Post.deleteOne({ _id: idd });
        res.json({ messgae: 'yes' });
    });

});


if (process.env.API_PORT) {
    app.listen(process.env.API_PORT);
}

module.exports = app;

