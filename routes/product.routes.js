const express = require('express');
const router = express.Router();
const Product = require('../model/product');
const Store = require('../model/store');
const userMiddleware = require('../Middleware/userMiddleware');
const superAdminMiddleware = require('../Middleware/superAdminMiddleware'); // à créer

// GET tous les produits validés (catalogue client)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isValidated: true })
      .populate('owner', 'username email')
      .populate('promotion');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET produit par ID (si validé)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isValidated: true })
      .populate('owner', 'username email')
      .populate('promotion');
    if (!product) return res.status(404).json({ message: 'Produit non trouvé ou non validé' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST ajouter un produit (lié au store user) - produit créé NON validé par défaut
router.post('/add', userMiddleware, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(403).json({ message: 'Vous n\'avez pas de store' });

    delete req.body.store;
    delete req.body.owner;
    delete req.body.promotion;
    delete req.body.isValidated; // interdire validation manuelle

    const productData = {
      ...req.body,
      owner: req.user._id,
      store: store._id,
      isValidated: false // par défaut non validé
    };

    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT modifier un produit (propriétaire) - interdit modifier isValidated ici
router.put('/:id', userMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez modifier que vos produits' });
    }

    const store = await Store.findOne({ _id: product.store, owner: req.user._id });
    if (!store) {
      return res.status(403).json({ message: 'Accès refusé : produit hors de votre store' });
    }

    // Interdire la modification directe de champs sensibles
    delete req.body.store;
    delete req.body.owner;
    delete req.body.promotion;
    delete req.body.isValidated;

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE produit (propriétaire)
router.delete('/:id', userMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez supprimer que vos produits' });
    }

    const store = await Store.findOne({ _id: product.store, owner: req.user._id });
    if (!store) {
      return res.status(403).json({ message: 'Accès refusé : produit hors de votre store' });
    }

    await product.deleteOne();
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT associer/désassocier promotion à un produit (propriétaire)
router.put('/:id/promotion', userMiddleware, async (req, res) => {
  try {
    const { promotionId } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    if (!product.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez modifier que vos produits' });
    }

    const store = await Store.findOne({ _id: product.store, owner: req.user._id });
    if (!store) {
      return res.status(403).json({ message: 'Accès refusé : produit hors de votre store' });
    }

    product.promotion = promotionId || null;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Routes superadmin ---

// GET produits en attente de validation
router.get('/admin/pending', userMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ isValidated: false })
      .populate('owner', 'username email')
      .populate('promotion');
    res.json(pendingProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT valider un produit
router.put('/admin/validate/:id', userMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    product.isValidated = true;
    await product.save();
    res.json({ message: 'Produit validé avec succès', product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;





