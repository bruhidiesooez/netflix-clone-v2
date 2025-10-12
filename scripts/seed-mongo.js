// Simple seed script to ensure the MongoDB database has at least one collection
// Usage: node scripts/seed-mongo.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env manually to read DATABASE_URL if needed
const envPath = path.resolve(__dirname, '..', '.env');
let env = {};
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/i);
    if (m) env[m[1]] = m[2];
  });
}

const url = env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const dbName = url.split('\/').slice(-1)[0].split('?')[0];
    const db = client.db(dbName);
    const movies = db.collection('movies');
    await movies.insertOne({ title: 'Seed movie', description: 'Inserted by seed script', createdAt: new Date() });
    console.log('Inserted sample document into movies collection in DB:', dbName);
  } catch (err) {
    console.error('Error seeding DB:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seed();
