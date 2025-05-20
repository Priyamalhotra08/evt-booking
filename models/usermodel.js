const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
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

    age:{
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Minimum age is 18'],
        max: [80, 'Age must be less than or equal to 80']
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

    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        
       
    },
    
})

const userModel = mongoose.model('user' , userSchema)
module.exports = userModel