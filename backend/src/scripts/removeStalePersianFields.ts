import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

const removeStalePersianFields = async (): Promise<void> => {
  await connectDatabase();

  try {
    const collection = mongoose.connection.db!.collection('books');
    const result = await collection.updateMany(
      { $or: [{ 'title.fa': { $exists: true } }, { 'description.fa': { $exists: true } }] },
      { $unset: { 'title.fa': '', 'description.fa': '' } }
    );

    console.log(`Removed stale Persian fields from ${result.modifiedCount} book(s).`);
  } finally {
    await disconnectDatabase();
  }
};

removeStalePersianFields().catch((error: unknown) => {
  console.error(`Cleanup failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
