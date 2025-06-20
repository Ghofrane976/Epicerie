const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware'); // Authentification utilisateur
const adminMiddleware = require('../middleware/adminMiddleware'); // Vérification rôle admin
const Store = require('../model/Store');
const Product = require('../model/Product');

// ✅ Route publique : afficher tous les stores
router.get('/', async (req, res, next) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    next(err);
  }
});

// ✅ Ajouter un nouveau store — uniquement admin
router.post('/add', userMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { name, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Nom et localisation requis' });
    }

    // Vérifie si l'utilisateur a déjà un store
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ message: 'Vous avez déjà un store' });
    }

    const newStore = new Store({
      name,
      location,
      description,
      owner: req.user._id,
    });

    await newStore.save();
    res.status(201).json({ message: 'Store créé avec succès', store: newStore });
  } catch (err) {
    next(err);
  }
});

// ✅ Voir les produits du vendeur connecté
router.get('/products', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Aucun store trouvé' });

    const products = await Product.find({ store: store._id });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// ✅ Ajouter un produit à son store
router.post('/products', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Aucun store trouvé' });

    const { name, price, description, stock, category, imageUrl } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      stock,
      category,
      imageUrl,
      store: store._id,
      owner: req.user._id,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ Modifier un produit (appartenant à son store)
router.put('/products/:id', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Aucun store trouvé' });

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, store: store._id },
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ Supprimer un produit (de son store)
router.delete('/products/:id', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Aucun store trouvé' });

    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
      store: store._id,
    });

    if (!deletedProduct) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    next(err);
  }
});

// ✅ Voir les infos de son store
router.get('/me', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Aucun store trouvé' });

    res.json(store);
  } catch (err) {
    next(err);
  }
});

// ✅ Mettre à jour son propre store
router.put('/update', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!store) return res.status(404).json({ message: 'Store non trouvé' });

    res.json(store);
  } catch (err) {
    next(err);
  }
});

// ✅ Supprimer son store + ses produits
router.delete('/delete', userMiddleware, async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store non trouvé' });

    await Product.deleteMany({ store: store._id });
    await Store.findByIdAndDelete(store._id);

    res.json({ message: 'Store et ses produits supprimés' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

