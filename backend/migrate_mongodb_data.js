import { MongoClient } from 'mongodb';

const OLD_URI = 'mongodb+srv://galivijay04_db_user:MvJ2Uv2WdA9oKzYg@cluster0.foklrlq.mongodb.net/iris_premium?retryWrites=true&w=majority&appName=Cluster0';
const NEW_URI = 'mongodb+srv://rameshp_db_user:Nw1kxTddnD7XvC7X@cluster0.ocqvlsn.mongodb.net/iris_premium?retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
  console.log('🔄 Starting MongoDB Data Migration...\n');

  const oldClient = new MongoClient(OLD_URI);
  const newClient = new MongoClient(NEW_URI);

  try {
    console.log('Connecting to Old Database...');
    await oldClient.connect();
    console.log('✅ Connected to Old Database.');

    console.log('Connecting to New Database...');
    await newClient.connect();
    console.log('✅ Connected to New Database.\n');

    const oldDb = oldClient.db('iris_premium');
    const newDb = newClient.db('iris_premium');

    const collections = await oldDb.listCollections().toArray();
    console.log(`Found ${collections.length} collection(s) to migrate:\n`);

    for (const col of collections) {
      const colName = col.name;
      if (colName.startsWith('system.')) continue;

      const oldCollection = oldDb.collection(colName);
      const newCollection = newDb.collection(colName);

      const docs = await oldCollection.find({}).toArray();
      console.log(`📦 Collection "${colName}": ${docs.length} document(s)...`);

      if (docs.length > 0) {
        // Clear new collection before importing
        await newCollection.deleteMany({});
        const insertRes = await newCollection.insertMany(docs);
        console.log(`  ✅ Successfully migrated ${insertRes.insertedCount} document(s) into "${colName}"`);
      } else {
        console.log(`  ℹ️ "${colName}" is empty, skipping document insertion.`);
      }
    }

    console.log('\n🎉 ALL COLLECTIONS AND DOCUMENTS MIGRATED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await oldClient.close();
    await newClient.close();
  }
}

migrateData();
