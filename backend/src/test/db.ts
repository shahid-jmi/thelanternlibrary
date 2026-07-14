import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

export const startTestDatabase = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

export const stopTestDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongod?.stop();
};

export const clearTestDatabase = async (): Promise<void> => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};
