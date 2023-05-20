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
const uploadMiddleware = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(process.env.DB_URI);



app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const salt = bcrypt.genSaltSync(10);
        const userDoc = await User.create({ username, password: bcrypt.hashSync(password, salt) });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }

});

app.post('/login', async (req, res) => {
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


app.get('/profile', async (req, res) => {
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



app.post('/logout', (req, res) => {
    res.cookie('token', '').json('logouted');
});


app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { token } = req.cookies;
    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
        if (err) throw err;
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    });

});


app.put('/edit', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
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
            cover: newPath ? newPath : postDoc.cover,
        });

        res.json(postDoc);
    });
});

app.get('/blogs', async (req, res) => {
    res.json(await Post.find().populate('author', ['username']).sort({ createdAt: -1 }));
});


app.get('/post/:id', async (req, res) => {
    const idd = req.params.id;
    try {
        const postDoc = await Post.findById(idd).populate('author', ['username']);
        res.json(postDoc);
    } catch (err) {
        res.status(404);
    }
});


app.delete('/delete/:id', async (req, res) => {
    const idd = req.params.id;
    const { token } = req.cookies;
    jwt.verify(token, process.env.SECRET_KEY, {}, async (err, info) => {
        const postDoc = await Post.findById(idd);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('you are not the author');
        }
        await Post.deleteOne({ _id: idd });
        res.json({ messgae: 'yes' });
    });
});


app.listen(4000);

