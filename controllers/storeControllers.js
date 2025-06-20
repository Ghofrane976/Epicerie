// controllers/storeController.js
const Store = require('../model/storeModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription / création du vendeur (admin)
exports.registerStore = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si email existe déjà
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer vendeur
    const newStore = new Store({
      name,
      email,
      password: hashedPassword,
    });

    await newStore.save();

    res.status(201).json({ message: 'Vendeur créé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Connexion vendeur
exports.loginStore = async (req, res) => {
  try {
    const { email, password } = req.body;

    const store = await Store.findOne({ email });
    if (!store) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }

    // Vérifier mot de passe
    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }

    // Créer token JWT
    const token = jwt.sign(
      { id: store._id, email: store.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, store: { id: store._id, name: store.name, email: store.email } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer infos vendeur (ex: pour tableau de bord)
exports.getStoreInfo = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId).select('-password');
    if (!store) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Modifier infos vendeur
exports.updateStoreInfo = async (req, res) => {
  try {
    const { name, email } = req.body;

    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ message: 'Vendeur non trouvé' });
    }

    if (name) store.name = name;
    if (email) store.email = email;

    await store.save();

    res.json({ message: 'Infos mises à jour avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
