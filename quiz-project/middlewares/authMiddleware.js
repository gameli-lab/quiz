import jwt from 'jsonwebtoken';

exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return
    res.status(403).json({ message: 'No token provided.'});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.'});
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' || 'Admin') {
        return res.status(403).json({ message: 'Access denied.'});
    }
    next();
};