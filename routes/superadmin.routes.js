const express = require('express');
const router = express.Router();

const User = require('../model/user');
const authMiddleware = require('../Middleware/authmiddlewares');
const superAdminMiddleware = require('../Middleware/superadminMiddleware');

// ✅ Route test pour superadmin
router.get('/dashboard', authMiddleware, superAdminMiddleware, (req, res) => {
  res.json({ message: 'Bienvenue sur le tableau de bord superadmin' });
});

// ✅ Route pour supprimer un utilisateur (ex. vendeur)
router.delete('/users/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
