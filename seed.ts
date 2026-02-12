import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/callu';

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const adminEmail = "admin@callu.com";
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log("Admin already exists");
  } else {
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      mobile: "+0000000000",
      status: "approved",
      role: "admin",
      avatarConfig: { 
        image: "/avatars/vibrant/1.png",
        color: "bg-zinc-100" 
      }
    });
    console.log("Admin created: admin@callu.com");
  }
  
  // Update existing users without avatars
  const usersWithoutAvatars = await User.find({ 
    'avatarConfig.image': { $exists: false },
    role: { $ne: 'admin' }
  });
  
  if (usersWithoutAvatars.length > 0) {
    console.log(`Updating ${usersWithoutAvatars.length} users with random avatars...`);
    
    const avatarFolders = ['3d', 'bluey', 'memo', 'notion', 'teams', 'toons', 'upstream', 'vibrant'];
    const avatarCounts: { [key: string]: number } = {
      '3d': 5,
      'bluey': 10,
      'memo': 20,
      'notion': 10,
      'teams': 5,
      'toons': 7,
      'upstream': 5,
      'vibrant': 20
    };
    
    for (const user of usersWithoutAvatars) {
      const randomFolder = avatarFolders[Math.floor(Math.random() * avatarFolders.length)];
      const randomImageNum = Math.floor(Math.random() * avatarCounts[randomFolder]) + 1;
      const avatarPath = `/avatars/${randomFolder}/${randomImageNum}.png`;
      
      user.avatarConfig = {
        ...user.avatarConfig,
        image: avatarPath
      };
      await user.save();
    }
    console.log("Avatar update complete!");
  }
  
  process.exit(0);
}

seed().catch(console.error);
