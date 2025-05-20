const express = require('express');
const filter = express.Router();
const evtModel = require('../models/evtmodel');
const userModel = require('../models/usermodel');
const moment = require('moment');
const jwt = require('jsonwebtoken');

function getDateRange(keyword) {
  const now = moment();
  switch (keyword) {
    case 'today': return { $gte: now.clone().startOf('day').toDate(), $lt: now.clone().endOf('day').toDate() };
    case 'tomorrow': return { $gte: now.clone().add(1, 'day').startOf('day').toDate(), $lt: now.clone().add(1, 'day').endOf('day').toDate() };
    case 'weekend': return { $gte: now.clone().day(6).startOf('day').toDate(), $lt: now.clone().day(7).endOf('day').toDate() };
    case 'week': return { $gte: now.clone().startOf('isoWeek').toDate(), $lt: now.clone().endOf('isoWeek').toDate() };
    case 'nextweek': return { $gte: now.clone().add(1, 'week').startOf('isoWeek').toDate(), $lt: now.clone().add(1, 'week').endOf('isoWeek').toDate() };
    case 'month': return { $gte: now.clone().startOf('month').toDate(), $lt: now.clone().endOf('month').toDate() };
    case 'nextmonth': return { $gte: now.clone().add(1, 'month').startOf('month').toDate(), $lt: now.clone().add(1, 'month').endOf('month').toDate() };
    default: return null;
  }
}

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.cookies.token) {
    return res.redirect('/login');
  }
  
  try {
    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.redirect('/login');
  }
};

// We need a function to extract state from address
function extractStateFromAddress(address) {
  // List of valid Indian states from your schema
  const validStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  // Check if any of the states are in the address
  for (const state of validStates) {
    if (address.includes(state)) {
      return state;
    }
  }
  
  return null;
}

filter.get('/game', isLoggedIn, async (req, res) => {
  try {
    const { date, language, comedyType, price } = req.query;
    
    // Get user information including state
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      return res.redirect('/login');
    }
    
    // First, get all comedy events
    const baseQuery = { category: 'Interactive games' };

    // Add additional filters if provided
    if (date) {
      const range = getDateRange(date);
      if (range) baseQuery.date = range;
    }
    
    if (language) baseQuery.language = language;
    
    if (comedyType) baseQuery.comedyType = comedyType;
    
    if (price) {
      switch (price) {
        case 'free': baseQuery.price = 0; break;
        case 'under500': baseQuery.price = { $lt: 500 }; break;
        case '500to1000': baseQuery.price = { $gte: 500, $lte: 1000 }; break;
        case '1000to2000': baseQuery.price = { $gte: 1000, $lte: 2000 }; break;
        case 'above2000': baseQuery.price = { $gt: 2000 }; break;
      }
    }

    // Find all comedy events
    const allEvents = await evtModel.find(baseQuery);
    
    // Filter events to only include those in the user's state
    const userState = user.state;
    const eventsInUserState = allEvents.filter(event => {
      // Check if the event address contains the user's state
      return event.address.includes(userState);
    });
    
    // Render the list view with filtered events and user data
    res.render('game', { 
      events: eventsInUserState,
      user,
      state: user.state,
      name: user.name
    });
    
  } catch (err) {
    console.error('Filter Error:', err);
    res.status(500).json({ error: 'Something went wrong while filtering' });
  }
});

module.exports = filter;