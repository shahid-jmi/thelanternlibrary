import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

const migrateCoverImages = async (): Promise<void> => {
  await connectDatabase();

  try {
    const collection = mongoose.connection.db!.collection('books');
    const staleBooks = await collection.find({ coverImage: { $type: 'string' } }).toArray();

    console.log(`Found ${staleBooks.length} book(s) with a legacy string coverImage.`);

    for (const book of staleBooks) {
      const url = book.coverImage as string;
      await collection.updateOne(
        { _id: book._id },
        { $set: { coverImage: { url, publicId: null } } }
      );
      console.log(
        `Migrated "${(book.title as { en?: string } | undefined)?.en ?? book._id}": ${url}`
      );
    }

    console.log('Migration complete.');
  } finally {
    await disconnectDatabase();
  }
};

migrateCoverImages().catch((error: unknown) => {
  console.error(`Migration failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
