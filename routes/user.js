const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') // ✅ fixed typo
const { body, validationResult } = require('express-validator')
const userModel = require('../models/usermodel')
 
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// List of valid Indian states and union territories
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
// Route to render signup page
router.get('/register', (req, res) => {
  res.render('signup')
})

// POST /register route with validation
router.post(
  '/register',
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
    body('state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isIn(validStates).withMessage('Invalid state or union territory'),

  body('password') 
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/).withMessage('Password must contain at least one special character (@$!%*?&)'),

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Validation failed',
      })
    }

    const { email, name, age, state, password } = req.body

    try {
      // Check if email is already registered - THIS WAS MISSING
      const existingUser = await userModel.findOne({ email });
      
      if (existingUser) {
        return res.status(400).json({
          errors: [{ msg: 'Email is already registered. Please log in.' }],
        });
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10)

      // Create new user
      const user = await userModel.create({
        email,
        name,
        age,
        state,
        password: hashPassword,
      })

      console.log('User created:', user)
   
      // Return JSON response for API client
      return res.status(201).json({ 
        message: 'Registration successful',
        render: '/login'
      });

    } catch (err) {
      console.error('Error during registration:', err)
      res.status(500).json({ message: 'Server error. Please try again later.' })
    }
  }
)
const isLoggedIn = (req, res, next) => {
  if (!req.cookies.token) return res.redirect('/login');
  try {
    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}; 
router.get('/login' , (req, res) =>{
  res.render('signin')
})
// aur haa protected routes to wo hotaa h naa vip room type ki bs wohi us cheez ko acess kr skta h jo login ho ? haa but ekj chiz aur btai thi sunle meri abb bol
router.post(
  '/login',
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/).withMessage('Password must contain at least one special character (@$!%*?&)'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('signin', {
        errors: errors.array(),
      });
    }

    const { email, password, remember } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).render('signin', {
        errors: [{ msg: 'User not found' }],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('signin', {
        errors: [{ msg: 'Invalid credentials' }],
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name:user.name,
      },
      process.env.JWT_SECRET
    );

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
    }
const cookieOptions = remember
      ? { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
      : {};
    res.cookie('token', token, cookieOptions);
    res.status(200).render('home', {user, state:user.state, name:user.name});
  }
);
router.get('/', async (req, res) => {
  let user = null;
  let state = '';
  let name = '';
  // If user is logged in, get their info
  if (req.cookies.token) {
    try {
      const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      user = await userModel.findOne({ email: data.email });
      if (user) {
        state = user.state;
        name = user.name;
      }
    } catch (err) {
      // Invalid token, ignore
    }
  }
  res.render('home', { user, state, name });
});


router.get('/category' , isLoggedIn, async (req,res) =>{
  const user = await userModel.findOne({email: req.user.email})
  if (!user) {
      return res.redirect('/login');
    }
    else{
  res.render('category' , { user , state:user.state, name:user.name})
    }
})


// Show forgot password form
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { errors: [], success: null });
});

// Handle forgot password form submission
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.render('forgot-password', { errors: [{ msg: 'No user found with that email.' }], success: null });
  }
  // Generate a reset token (for demo, use JWT, in production use a random string)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  // Send reset link via email (for demo, just show the link)
  const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  // TODO: Send email here
  res.render('forgot-password', { errors: [], success: `Reset link: <a href="${resetLink}">${resetLink}</a>` });
});

// Show reset password form
router.get('/reset-password/:token', (req, res) => {
  res.render('reset-password', { token: req.params.token, errors: [], success: null });
});

// Handle reset password form submission
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const hashPassword = await bcrypt.hash(password, 10);
    await userModel.findByIdAndUpdate(decoded.id, { password: hashPassword });
  res.redirect('/login');
  } catch (err) {
    res.render('reset-password', { token: null, errors: [{ msg: 'Invalid or expired token.' }], success: null });
  }
});
module.exports = router
