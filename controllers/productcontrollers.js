const Product = require('../model/Product');

// GET all products (pour afficher les produits du vendeur/admin)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find(); // ici pas besoin de filtrer par vendeur car 1 seul vendeur
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST ajouter un produit
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur création produit' });
  }
};

// PUT modifier un produit par id
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Erreur mise à jour produit' });
  }
};

// DELETE supprimer un produit par id
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    res.status(400).json({ message: 'Erreur suppression produit' });
  }
};
