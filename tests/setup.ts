import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// this runs BEFORE all tests
// it starts a fake MongoDB in memory
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// this runs AFTER all tests
// it stops the fake MongoDB and closes connection
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// this runs after EACH test
// it clears all data so tests don't affect each other
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});