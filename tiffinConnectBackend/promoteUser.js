import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address. Usage: node promoteUser.js <email>");
  process.exit(1);
}


const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully.");
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: "admin" },
      { new: true }
    );
    if (!user) {
      console.error(`User not found with email: ${email}`);
    } else {
      console.log(`Success! Promoted ${user.name} (${user.email}) to role: admin.`);
    }
  } catch (err) {
    console.error("Error promoting user:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

run();
