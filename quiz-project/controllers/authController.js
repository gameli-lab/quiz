import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

exports.register = async (req, res) => {
    const {fullName, username, email, password, role} = req.body;
    if (!['student', 'teacher'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role selected'});
    }
    try {
        const newUser = new User({ fullName, username, email, password, role });
        await newUser.save();
        res.status(200).json({ message: 'Registration sucessful'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.finOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials'});
        }
        const token = jwt.sign({ id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
        res.status(200).json({ token, role: user.role, });
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};