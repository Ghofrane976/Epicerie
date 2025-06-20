const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');

const userMiddleware = require('../Middleware/userMiddleware');
const adminMiddleware = require('../Middleware/adminMiddleware');
const superAdminMiddleware = require('../Middleware/superadminMiddleware'); // Assure-toi qu'il existe

// Route test simple
router.get('/', (req, res) => {
  res.json({ message: 'Route utilisateur fonctionnelle' });
});

// Inscription user/admin (selon champ admin dans body)
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password, admin } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = admin === true ? 'admin' : 'user';

    const newUser = new User({ email, username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({
      message: `Compte ${role} créé avec succès`,
      user: { email, username, role }
    });
  } catch (err) {
    next(err);
  }
});

// Nouvelle route : création superadmin, accessible **seulement aux superadmins**
router.post('/register-superadmin', userMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, username, password: hashedPassword, role: 'superadmin' });
    await newUser.save();

    res.status(201).json({
      message: 'Compte superadmin créé avec succès',
      user: { email, username, role: 'superadmin' }
    });
  } catch (err) {
    next(err);
  }
});

// Connexion
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    });
  } catch (err) {
    next(err);
  }
});

// Route protégée admin
router.get('/admin-only', userMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'Bienvenue admin !', user: req.user.username });
});

module.exports = router;

