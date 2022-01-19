const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

const router = new express.Router();

router.post('/users', async (req, res) => {
    let user = null;
    try {
        user = new User(req.body);
    } catch (e) {
        res.status(400).send(e);
    }

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

router.post('/users/login', async (req, res) => {
    const _body = req.body;
    if (!_body) {
        return res.status(500).send("Body is required");
    }

    try {
        const user = await User.findByCredentials(_body.email, _body.password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
})

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.status(200).send("Logged out of all sessions successfullyLogged out successfully");
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.status(200).send("Logged out successfully");
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', authMiddleware, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', authMiddleware, async (req, res) => {
    const _body = req.body;
    if (!_body) {
        return res.status(400).send("Body is required");
    }

    const intendedUpdates = Object.keys(req.body);
    const allowedPropertiesToUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = intendedUpdates.every((update) => 
        allowedPropertiesToUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        const user = req.user;
        intendedUpdates.forEach((update) => user[update] = _body[update]);
        await user.save();

        if (!user) {
            return res.status(404).send()
        }

        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', authMiddleware, async (req, res) => {
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be of image type'));
        }

        cb(undefined, true);
    }
})

router.post('/users/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send(200);
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(200);
})

router.get('/users/:id/avatar', async (req, res) => {
    const _id = req.params.id;
    if (!_id) {
        return res.status(400).send("Id is required");
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router