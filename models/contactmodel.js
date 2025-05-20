const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be less than 50 characters'],
    match: [
      /^[a-zA-Z\s]+$/,
      'Name can only contain letters and spaces'
    ]
    },
    email:{
        type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        enum: {
          values: [  // States
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
            'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
            'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
            'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
            'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            // Union Territories
            'Andaman and Nicobar Islands', 'Chandigarh',
            'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
            'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'],
          message: '{VALUE} is not a valid state'
        },
        trim: true
      },
      telephone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
          validator: function (v) {
            return /^\d{10}$/.test(v); // 10-digit phone number
          },
          message: props => `${props.value} is not a valid 10-digit phone number`
        }
      },
      enquiry: {
        type: String,
        required: [true, 'Message is required'],
        minlength: [10, 'Message must be at least 10 characters long'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
      }
})
module.exports = mongoose.model('Contact', contactSchema)