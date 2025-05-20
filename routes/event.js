const express = require('express');
const evt = express.Router();
const multer = require('multer');
const evtModel = require('../models/evtmodel');
const path = require('path');
const crypto = require('crypto');
const {body, validationResult} = require('express-validator');

evt.use(express.json());
evt.use(express.urlencoded({ extended: true }));
evt.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/img')); // Correct path
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(10, (err, buffer) => {
      if (err) throw err;
      const fn = buffer.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
});

const upload = multer({ storage: storage });
// yaha database se store hua data fetch hor ra h
// GET route to render the event form
evt.get('/eventForm', (req, res) => {
  const selectedCategory = req.query.category || null; 
  res.render('eventForm', { selectedCategory });
  

});

// POST route to handle event form submission
evt.post(
  '/eventForm',
  upload.fields([
    { name: 'artistPhotos', maxCount: 5 },
    { name: 'eventPhotos', maxCount: 5 }
  ]),
  
  // Validation middleware
  body('title').notEmpty().withMessage('Title is required.'),
  body('category').notEmpty().isIn([
    'Comedy', 'Kids', 'Adventure', 'Music',
    'Art', 'Workshops', 'Interactive games',
    'Upskill', 'Food'
  ]).withMessage('Invalid category.'),
  body('date').notEmpty().withMessage('Date must be valid.').custom((value)=>{
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 for comparison
    if (selectedDate < today) {
      throw new Error('Please select a valid date. You cannot select a past date.');
    }
    return true;
  }),
  
  body('time').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be valid (HH:MM).'),
  body('age').notEmpty().withMessage('Age group is required.'),
  body('language').notEmpty().withMessage('Language is required.'),
  body('address').notEmpty().withMessage('Address is required.'),
  body('artists').isArray({ min: 1 }).withMessage('At least one artist must be provided.'),
  body('description').notEmpty().isLength({ max: 500 }).withMessage('Description must be under 500 characters.'),
  body('price').notEmpty().isNumeric().withMessage('Price must be a number.'),
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Validation failed',
      });
    }

    try {
      const { title, category, date, time, age, language, address, artists, description, price } = req.body;

      const artistPhotoFiles = req.files?.artistPhotos || [];
const eventPhotoFiles = req.files?.eventPhotos || [];

const artistPhotos = artistPhotoFiles.map(file => file.filename);
const eventPhotos = eventPhotoFiles.map(file => file.filename);


      const newEvent = await evtModel.create({
        title,
        category,
        date,
        time,
        age,
        language,
        address,
        artists,
        description,
        price,
        artistPhotos,
        eventPhotos,
      });

      res.status(201).json({ 
        message: 'Event created successfully!', 
        event: newEvent 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);


module.exports = evt;