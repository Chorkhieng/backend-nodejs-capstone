require('dotenv').config()
const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

// MongoDB connection URL with authentication options
const url = process.env.MONGO_URL
const filename = path.join(__dirname, 'secondChanceItems.json')
const dbName = 'secondChance'
const collectionName = 'secondChanceItems'

// Load the array of items into the data object
const data = JSON.parse(fs.readFileSync(filename, 'utf8')).docs

// Connect to database and insert data into the collection
async function loadData () {
  const client = new MongoClient(url)

  try {
    // Connect to the MongoDB client
    await client.connect()
    console.log('Connected successfully to server')

    // Database will be created if it does not exist
    const db = client.db(dbName)

    // Collection will be created if it does not exist
    const collection = db.collection(collectionName)
    const documents = await collection.find({}).toArray()

    if (documents.length === 0) {
      // Insert data into the collection
      const insertResult = await collection.insertMany(data)
      console.log('Inserted documents:', insertResult.insertedCount)
    } else {
      console.log('Items already exist in DB')
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    // Close the connection
    await client.close()
  }
}

loadData()

module.exports = { loadData }
