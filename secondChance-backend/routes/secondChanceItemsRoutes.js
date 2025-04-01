const express = require('express')
const multer = require('multer')
const router = express.Router()
const connectToDatabase = require('../models/db')
const logger = require('../logger')
require('../util/import-mongo/index')
require('../util/import-mongo/secondChanceItems.json')

// Define the upload directory path
const directoryPath = 'public/images'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directoryPath) // Specify the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname) // Use the original file name
  }
})

const upload = multer({ storage })

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
  logger.info('/ called')
  try {
    // Step 2: task 1 - insert code here
    const db = await connectToDatabase()

    // Step 2: task 2 - insert code here
    const collection = db.collection('secondChanceItems')

    // Step 2: task 3 - insert code here
    const secondChanceItems = await collection.find({}).toArray()

    // Step 2: task 4 - insert code here
    res.json(secondChanceItems)
  } catch (e) {
    logger.error('Oops, something went wrong', e)
    next(e)
  }
})

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // Step 3: task 1 - insert code here
    const db = await connectToDatabase()

    // Step 3: task 2 - insert code here
    const collection = db.collection('secondChanceItems')

    // Step 3: task 3 - insert code here
    let secondChanceItem = req.body

    // Step 3: task 4 - insert code here
    const lastItemQuery = await collection.find().sort({ id: -1 }).limit(1).toArray()
    if (lastItemQuery.length > 0) {
      secondChanceItem.id = (parseInt(lastItemQuery[0].id, 10) + 1).toString()
    } else {
      secondChanceItem.id = '1'
    }

    // Step 3: task 5 - insert code here
    secondChanceItem.date_added = Math.floor(Date.now() / 1000)

    // Step 3: task 6
    secondChanceItem = await collection.insertOne(secondChanceItem)

    res.status(201).json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
  try {
    // Step 4: task 1 - insert code here
    const db = await connectToDatabase()

    // Step 4: task 2 - insert code here
    const collection = db.collection('secondChanceItems')

    // Step 4: task 3 - insert code here
    const { id } = req.params
    const secondChanceItem = await collection.findOne({ id })

    // Step 4: task 4 - insert code here
    if (!secondChanceItem) {
      return res.status(404).send('secondChanceItem not found')
    }

    res.json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Update an existing item
router.put('/:id', async (req, res, next) => {
  try {
    // Step 5: Task 1 - Retrieve the database connection
    const db = await connectToDatabase()

    // Step 5: Task 2 - Get the collection
    const collection = db.collection('secondChanceItems')

    // Step 5: Task 3 - Extract id from request params and find the item
    const { id } = req.params
    const secondChanceItem = await collection.findOne({ id })

    if (!secondChanceItem) {
      logger.error('secondChanceItem not found')
      return res.status(404).json({ error: 'secondChanceItem not found' })
    }

    // Step 5: Task 4 - Construct the update object
    const updatedItem = {
      category: req.body.category,
      condition: req.body.condition,
      age_days: req.body.age_days,
      description: req.body.description,
      age_years: Number((req.body.age_days / 365).toFixed(1)), // Calculate age in years
      updatedAt: new Date()
    }

    const updateResult = await collection.findOneAndUpdate(
      { id },
      { $set: updatedItem },
      { returnDocument: 'after' }
    )

    // Step 5: Task 5 - Return the updated item
    if (updateResult.value) {
      res.json({ updated: 'success', item: updateResult.value })
    } else {
      res.json({ updated: 'failed' })
    }
  } catch (e) {
    next(e)
  }
})

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
  try {
    // Step 6: task 1 - insert code here
    const db = await connectToDatabase()

    // Step 6: task 2 - insert code here
    const collection = db.collection('secondChanceItems')

    // Step 6: task 3 - insert code here
    const { id } = req.params
    const secondChanceItem = await collection.findOne({ id })

    if (!secondChanceItem) {
      logger.error('secondChanceItem not found')
      return res.status(404).json({ error: 'secondChanceItem not found' })
    }

    // Step 6: task 4 - insert code here
    await collection.deleteOne({ id })
    res.json({ deleted: 'success' })
  } catch (e) {
    next(e)
  }
})

module.exports = router
