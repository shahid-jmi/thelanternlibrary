import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

const renameCoverImagePublicIdToKey = async () => {
  await connectDatabase();

  try {
    const collection = mongoose.connection.db.collection('books');
    const result = await collection.updateMany(
      { 'coverImage.publicId': { $exists: true } },
      { $rename: { 'coverImage.publicId': 'coverImage.key' } }
    );

    console.log(`Renamed coverImage.publicId -> coverImage.key on ${result.modifiedCount} book(s).`);
  } finally {
    await disconnectDatabase();
  }
};

renameCoverImagePublicIdToKey().catch((error) => {
  console.error(`Migration failed: ${error.message}`);
  process.exit(1);
});
