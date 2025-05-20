const express = require('express');
const { v4: uuidv4 } = require('uuid');
const UserProfile = require('../models/UserProfile');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const {
      name, bloodGroup, allergies, medicalConditions,
      emergencyContact, email
    } = req.body;

    const existingUser = await UserProfile.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const uniqueId = uuidv4();

    const newUser = new UserProfile({
      uniqueId,
      name,
      bloodGroup,
      allergies,
      medicalConditions,
      emergencyContact,
      email
    });

    await newUser.save();
    console.log(`New user registered: ${uniqueId}`);
    res.status(201).json({ uniqueId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update user profile
router.patch('/update', async (req, res) => {
  try {
    const { uniqueId, updates, otp } = req.body;

    if (!uniqueId || !updates || !otp) {
      return res.status(400).json({ error: 'uniqueId, updates, and otp are required' });
    }

    const user = await UserProfile.findOne({ uniqueId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check OTP validity for every update request
    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid OTP' });

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      await sendOtpExpired(user.email); // Send expired OTP email
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check for duplicates (email and emergencyContact)
    if (updates.email && updates.email !== user.email) {
      const existingEmail = await UserProfile.findOne({ email: updates.email });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    if (updates.emergencyContact && updates.emergencyContact !== user.emergencyContact) {
      const existingContact = await UserProfile.findOne({ emergencyContact: updates.emergencyContact });
      if (existingContact) {
        return res.status(409).json({ error: 'Emergency contact already in use' });
      }
    }

    // Apply updates
    for (let key in updates) {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    }

    // Reset OTP hash and expiry after profile update
    user.otpHash = null;
    user.otpExpiry = null;
    user.isOtpVerified = false; // Reset OTP verification flag after update

    await user.save();
    console.log(`User profile updated: ${uniqueId}`);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Fetch profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await UserProfile.findOne({ uniqueId: req.params.id });
    if (!user) return res.status(404).json({ error: 'Profile not found' });

    const {
      name, bloodGroup, allergies, medicalConditions,
      emergencyContact, email
    } = user;

    res.json({
      name,
      bloodGroup,
      allergies,
      medicalConditions,
      emergencyContact,
      email
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
