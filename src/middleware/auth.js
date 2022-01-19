const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error()
        }

        req.token = token;
        req.user = user;
    } catch (e) {
        return res.status(401).send({ error: 'Unable to log you in' });
    }

    next();
}

module.exports = auth;