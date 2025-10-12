const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.resolve(__dirname, '..', '.env'), 'utf8');
const m = raw.match(/DATABASE_URL\s*=\s*"(.*)"/);
if (!m) {
  console.error('DB URL not found');
  process.exit(1);
}
const url = m[1];

async function run() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const dbName = url.split('/').slice(-1)[0].split('?')[0];
    const db = client.db(dbName);
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
