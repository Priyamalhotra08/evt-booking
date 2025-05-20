const express = require('express');
const card = express.Router();
const evtModel = require('../models/evtmodel');
card.get('/card/:id', async (req, res) => {
    try {
      const eventId = req.params.id;
      
      // Find the specific event by ID
      const events = await evtModel.find({ _id: eventId });
      
      if (events.length === 0) {
        return res.status(404).send('Event not found');
      }
      
      res.render('card', { events });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  // Keep the old route as a fallback or for testing
// Fallback route for testing (displays first event)
card.get('/card', async (req, res) => {
    try {
      const events = await evtModel.find().limit(1);
      
      if (events.length === 0) {
        return res.status(404).render('error', { 
          message: 'No events found',
          error: { status: 404, stack: '' }
        });
      }
      
      res.render('card', { events });
    } catch (err) {
      console.error('Error fetching events:', err);
      return res.status(500).render('error', { 
        message: 'Server error',
        error: { status: 500, stack: process.env.NODE_ENV === 'development' ? err.stack : '' }
      });
    }
});

module.exports = card;
  module.exports = card;