const express = require('express');
const search = express.Router();
const evtModel = require('../models/evtmodel');
const jwt = require('jsonwebtoken')
const userModel = require('../models/usermodel');

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
}

search.get('/search', isLoggedIn, async (req, res) => {
  try {
    const query = req.query.query;
    const regex = new RegExp(query, 'i');
    const user = await userModel.findById(req.user.id);
      if (!user) {
      return res.redirect('/login');
    }
    
    const events = await evtModel.find({
      $or: [{ title: regex }, { category: regex }]
    });
    console.log(events);
    
    // Fixed: using events instead of yourEventsArray
    res.render('search', { events, user, query });
  } catch (error) {
    console.error(error);
return res.redirect('/login');
  } 
});

module.exports = search;