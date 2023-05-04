const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');


require('dotenv').config();



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

mongoose.connect(process.env.DB_URI);

const secretKey = crypto.randomBytes(64).toString('hex');


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
        const token = await jwt.sign({ username, id: UserDoc.id }, secretKey);
        res.cookie('token', token).json({ username, id: UserDoc.id });
    }
});


app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.sendStatus(401);
        }
        const info = await jwt.verify(token, secretKey);
        res.json(info);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});



app.post('/logout', (req, res) => {
    console.log('logour middleware called');
    res.cookie('token', '').json('logouted');
});



app.listen(4000);

