const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

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
        res.status(200).json('login worked!');
    }
});




app.listen(4000);

