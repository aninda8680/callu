import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/callu';

async function fixAvatars() {
  await mongoose.connect(MONGODB_URI);

  // Updated avatar counts matching actual files
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

  // Get all users with avatars
  const usersWithAvatars = await User.find({ 
    'avatarConfig.image': { $exists: true },
    role: { $ne: 'admin' }
  });

  console.log(`Found ${usersWithAvatars.length} users with avatars to check...`);
  
  let fixedCount = 0;
  for (const user of usersWithAvatars) {
    const currentPath = user.avatarConfig?.image;
    if (!currentPath) continue;

    // Extract folder and number from path like "/avatars/upstream/17.png"
    const match = currentPath.match(/\/avatars\/([^/]+)\/(\d+)\.png/);
    if (!match) continue;

    const [, folder, numStr] = match;
    const num = parseInt(numStr);
    const maxForFolder = avatarCounts[folder];

    // Check if the number exceeds the available images
    if (maxForFolder && num > maxForFolder) {
      // Generate a valid random number for this folder
      const validNum = Math.floor(Math.random() * maxForFolder) + 1;
      const newPath = `/avatars/${folder}/${validNum}.png`;
      
      user.avatarConfig.image = newPath;
      await user.save();
      
      console.log(`Fixed ${user.name}: ${currentPath} → ${newPath}`);
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} invalid avatar paths!`);
  process.exit(0);
}

fixAvatars().catch(console.error);
