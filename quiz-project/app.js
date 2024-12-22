import User from './models/User';

const seedAdmin = async () => {
    const adminExists = await User.fionOne({email:'btorfu@proton.me'});
    if (!adminExists) {
        const admin = new User({
            fullName: 'Benjamin Torfu',
            username: 'Admin',
            email: 'btorfu@proton.me',
            password: '4k!uhd.TV',
            role: 'admin'
        });
        await admin.save();
        console.log('Admin accoun t created sucessfully');
    }
};

module.exports = seedAdmin;