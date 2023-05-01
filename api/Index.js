const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


require('dotenv').config();


crypto.randomBytes(32).toString('hex');

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

mongoose.connect(process.env.DB_URI);

const secretKey = crypto.randomBytes(32).toString('hex');


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
        res.cookie('token', token).json('ok');
    }
});




app.listen(4000);

