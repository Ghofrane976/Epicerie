const Promotion = require('../models/Promotion');

// GET toutes les promotions
exports.getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST ajouter une promotion
exports.createPromotion = async (req, res) => {
  try {
    // Ici tu pourrais ajouter une validation simple avant de créer la promo
    const { title, discountPercentage, startDate, endDate } = req.body;
    if (!title || discountPercentage == null || !startDate || !endDate) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'La date de début doit être avant la date de fin' });
    }

    const promo = new Promotion(req.body);
    await promo.save();
    res.status(201).json(promo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erreur création promotion' });
  }
};

// PUT modifier promotion
exports.updatePromotion = async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Promotion non trouvée' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erreur mise à jour promotion' });
  }
};

// DELETE supprimer promotion
exports.deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Promotion non trouvée' });
    res.json({ message: 'Promotion supprimée' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erreur suppression promotion' });
  }
};

