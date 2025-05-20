const express = require('express');
const router = express.Router();
const userModel = require('../models/usermodel');
const evtModel = require('../models/evtmodel');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Storage for OTPs (in production, use Redis or another proper store)
const otpStorage = {};

// Middleware to check if user is logged in (reusing from your user.js)
const isLoggedIn = (req, res, next) => {
  if (!req.cookies.token) return res.redirect('/login');
  
  try {
    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.redirect('/login');
  }
};

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Payment page route
router.get('/payment', isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
     const eventId = req.query.eventId;
      let event = null;
    if (eventId) {
      event = await evtModel.findById(eventId);
    }

    // Pass event, quantity, and price to the template
    res.render('payment', { 
      user, 
      name: user.name, 
      event, 
      price: event ? event.price : null,
      quantity: event ? event.quantity : null
    });
  } catch (error) {
    console.error('Error loading payment page:', error);
    res.status(500).send('Server error');
  }
});


// Send OTP route
router.post('/send-payment-otp', isLoggedIn, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    const user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with timestamp and payment details
    otpStorage[user.email] = {
      otp,
      timestamp: Date.now(),
      amount: parseFloat(amount),
      attempts: 0
    };

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: user.email, // ye h meri id jis a h mail ohhh 
      subject: 'Payment Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4a90e2;">Payment Verification</h2>
          <p>Hello ${user.name},</p>
          <p>You are attempting to make a payment of ₹${amount}.</p>
          <p>Your OTP for payment verification is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this payment, please ignore this email.</p>
          <p>Thank you,<br>Your Event Platform Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email',
      email: user.email.replace(/(.{3})(.*)(@.*)/, '$1***$3') // Mask email for security
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP and process payment
router.post('/verify-payment-otp', isLoggedIn, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await userModel.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpData = otpStorage[user.email];
    
    // Check if OTP exists
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please request a new OTP.' });
    }

    // Check OTP expiry (5 minutes)
    if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
      delete otpStorage[user.email];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP.' });
    }

    // Increment attempt counter
    otpData.attempts += 1;

    // Max 3 attempts
    if (otpData.attempts > 3) {
      delete otpStorage[user.email];
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Check if OTP is correct
    if (otpData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.` 
      });
    }

    // OTP is valid, process payment logic would go here
    // For demo purposes, we'll simulate a 90% success rate
    const isSuccessful = Math.random() < 0.9;
    
    // Create a transaction record in the database
    // Here you'd typically have a Transaction model, but we'll mock it
    const transaction = {
      userId: user._id,
      email: user.email,
      amount: otpData.amount,
      status: isSuccessful ? 'SUCCESS' : 'FAILED',
      timestamp: new Date(),
      transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000)
    };
    
    // In a real app, you'd save this to your database
    console.log('Transaction completed:', transaction);
    
    // Clear OTP after verification
    delete otpStorage[user.email];
    
    // Return transaction result
    if (isSuccessful) {
      res.status(200).json({ 
        success: true, 
        message: 'Payment successful',
        transaction: {
          id: transaction.transactionId,
          amount: transaction.amount,
          date: transaction.timestamp
        }
      });
    } else {
      res.status(200).json({ 
        success: false, 
        message: 'Payment failed',
        transaction: {
          id: transaction.transactionId,
          amount: transaction.amount,
          date: transaction.timestamp,
          reason: 'Payment gateway declined the transaction'
        }
      });
    }
    console.log(user.email)
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Payment result page
router.get('/payment-result', isLoggedIn, (req, res) => {
  const { status, txnId, amount } = req.query;
  res.render('payment-result', { 
    status, 
    txnId, 
    amount,
    name: req.user.name
  });
});

module.exports = router;