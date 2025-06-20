const express = require('express');
const router = express.Router();
const Promotion = require('../model/promotion');  // <-- correction ici
const userMiddleware = require('../middleware/userMiddleware'); // si tu veux restreindre l'accès
const adminMiddleware = require('../middleware/adminMiddleware'); // si promo réservée aux admins

// Créer une promotion (uniquement admin)
router.post('/', userMiddleware, adminMiddleware, async (req, res) => {
  try {
    const promo = new Promotion(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Récupérer toutes les promotions
router.get('/', async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une promotion (admin)
router.put('/:id', userMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Promotion non trouvée' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer une promotion (admin)
router.delete('/:id', userMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Promotion non trouvée' });
    res.json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

