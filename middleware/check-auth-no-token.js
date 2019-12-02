const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    if (!req.headers.authorization) {
        return next();
    }
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.payload = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed.',
            err: 'Login is requried.'
        });
    }
};