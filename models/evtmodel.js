const mongoose = require('mongoose')

const evtSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Comedy', 'Kids', 'Adventure', 'Music',
        'Art', 'Workshops', 'Interactive games',
        'Upskill', 'Food'
      ],
      required: true
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // can also use Date if combining with date
    age: { type: Number, required: true },
    language: { type: String, required: true },
    address: { type: String, required: true },
    artists: [{ type: String, required: true }],
    
    description: { type: String, maxlength: 500, required: true },
    price: { type: Number, required: true },
  
    artistPhotos: [{ type: String }],
eventPhotos: [{ type: String }],
  
    
  });




const evtModel = mongoose.model('evt' , evtSchema)

module.exports = evtModel