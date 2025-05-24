const express = require('express');
const evt = express.Router();
const evtModel = require('../models/evtmodel');
const path = require('path');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary configuration
cloudinary.config({ 
  cloud_name: 'dozrdhryq', 
  api_key: '913241954996766', 
  api_secret: '80gqMjCNK5evFmRQoQgoN9RRAdc' 
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'events',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      public_id: `${Date.now()}-${file.originalname}`.replace(/\s+/g, '-')
    };
  }
});

const upload = multer({ storage: storage });

evt.use(express.json());
evt.use(express.urlencoded({ extended: true }));

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
  body('title').notEmpty().withMessage('Title is required.'),
  body('category').notEmpty().isIn([
    'Comedy', 'Kids', 'Adventure', 'Music',
    'Art', 'Workshops', 'Interactive games',
    'Upskill', 'Food'
  ]).withMessage('Invalid category.'),
  body('date').notEmpty().withMessage('Date must be valid.').custom((value) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

      const artistPhotos = artistPhotoFiles.map(file => file.path);
      const eventPhotos = eventPhotoFiles.map(file => file.path);

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
