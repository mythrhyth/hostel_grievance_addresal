import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Announcement from './src/models/Announcement.js';

dotenv.config();

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all indexes on the announcements collection
    const db = mongoose.connection.db;
    const collection = db.collection('announcements');
    
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes.map(i => ({ name: i.name, key: i.key })));

    // Drop the problematic compound index if it exists
    const compoundIndex = indexes.find(i => 
      i.key.targetHostels === 1 && i.key.targetRoles === 1
    );
    
    if (compoundIndex) {
      console.log('Dropping problematic index:', compoundIndex.name);
      await collection.dropIndex(compoundIndex.name);
      console.log('Index dropped successfully');
    } else {
      console.log('No problematic compound index found');
    }

    // Recreate the proper indexes
    await Announcement.createIndexes();
    console.log('Proper indexes created');

    const newIndexes = await collection.listIndexes().toArray();
    console.log('Updated indexes:', newIndexes.map(i => ({ name: i.name, key: i.key })));

  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fixIndex();
