import User from "./models/User.js";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
  const adminExists = await User.findOne({ email: "btorfu@proton.me" });
  if (!adminExists) {
    // const hashedPassword = await bcrypt.hash("4k!uhd.TV", 10);
    const admin = new User({
      name: "Benjamin Torfu",
      email: "btorfu@proton.me",
      password: "4k!uhd.TV",
      role: "admin",
    });
    await admin.save();
    console.log("Admin account created successfully");
  }
};

export default seedAdmin;
