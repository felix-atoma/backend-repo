const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server-core'); // ✅ Use core version
const User = require('../models/User');

let mongoServer;
let agent;

beforeAll(async () => {
  console.log('⏳ Starting MongoMemoryServer...');

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.6',  // ✅ Use stable, known version
      skipMD5: true      // ✅ Skip MD5 check for faster startup
    },
    instance: {
      dbName: 'test-db',
    },
    autoStart: true,
  });

  console.log('✅ MongoMemoryServer started');

  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('✅ Mongoose connected');
  agent = request.agent(app);
}, 30000); // ✅ Increase timeout to 30 seconds

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

const testUser = {
  username: 'testuser',
  password: 'testpassword123',
};

describe('Auth Routes', () => {
  test('POST /api/auth/register should register a new user', async () => {
    const res = await agent.post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201); // ✅ Adjust to your app logic (200 or 201)
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', testUser.username);
  });
});
