const express = require('express');
const contact = express.Router()
const contactModel = require('../models/contactmodel')
const {body, validationResult} = require('express-validator');

contact.get('/contact' , (req , res) => {
    res.render('contact')
})

contact.post('/contact', 
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('state')
    .notEmpty().withMessage('State is required')
    .isIn([
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
      'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ]).withMessage('Invalid state selected'),

  body('telephone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),

  body('enquiry')
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
    async (req, res) => {
        const errors = validationResult(req);
        const { name, email, state, telephone, enquiry } = req.body;
    
        if (!errors.isEmpty()) {
          return res.render('contact', {
            message: errors.array().map(err => err.msg).join('<br>'),
            messageType: 'danger',
            formData: req.body
          });
        }
    
        try {
          await contactModel.create({ name, email, state, telephone, enquiry });
          res.render('contact', {
            message: 'Your message has been submitted successfully!',
            messageType: 'success',
            formData: {} // Clear form on success
          });
        } catch (error) {
          res.render('contact', {
            message: 'There was an error submitting your form. Please try again later.',
            messageType: 'danger',
            formData: req.body
          });
        }
      }
    );
    



module.exports = contact