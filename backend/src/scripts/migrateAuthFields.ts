import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';

// Backfills the auth fields added for password-reset/force-change support
// onto any admin documents created before this migration. Safe to run
// multiple times — only touches documents missing the fields. Uses an
// aggregation-pipeline update (Mongo 4.2+) so passwordChangedAt can be
// derived from each document's own createdAt in a single pass.
const migrateAuthFields = async (): Promise<void> => {
  await connectDatabase();

  try {
    const collection = mongoose.connection.db!.collection('admins');
    const result = await collection.updateMany({ mustChangePassword: { $exists: false } }, [
      {
        $set: {
          mustChangePassword: false,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
          // createdAt already reflects when the (only) password on record
          // was set — the closest available signal for a pre-existing admin.
          passwordChangedAt: { $ifNull: ['$createdAt', '$$NOW'] },
        },
      },
    ]);

    console.log(`Backfilled auth fields on ${result.modifiedCount} admin(s).`);
  } finally {
    await disconnectDatabase();
  }
};

migrateAuthFields().catch((error: unknown) => {
  console.error(`Migration failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
