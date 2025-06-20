const Order = require('../model/order');
const Store = require('../model/store');
const Product = require('../model/product');

// Vérifie si une commande appartient bien au store de l'admin connecté
async function checkOrderBelongsToStore(order, adminUserId) {
  const store = await Store.findOne({ owner: adminUserId });
  if (!store) return false;

  for (const item of order.products) {
    const product = await Product.findById(item.productId);
    if (product && product.store.equals(store._id)) {
      return true;
    }
  }
  return false;
}

// Créer une commande (client)
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customerId: req.user._id,  // Associe la commande au client connecté
      status: 'en attente',      // statut initial
      paymentStatus: 'en attente' // statut paiement initial
    };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Erreur création commande', error: error.message });
  }
};

// Voir toutes les commandes (admin, uniquement celles liées à son store)
exports.getOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(403).json({ message: 'Vous n’avez pas de store' });

    // Récupérer les IDs des produits de ce store
    const storeProductIds = await Product.find({ store: store._id }).distinct('_id');

    // Trouver les commandes contenant au moins un produit de ce store
    const orders = await Order.find({ 'products.productId': { $in: storeProductIds } });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier l'état d'une commande (admin) — uniquement si commande liée à son store
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });

    const belongs = await checkOrderBelongsToStore(order, req.user._id);
    if (!belongs) return res.status(403).json({ message: 'Accès refusé : commande hors de votre store' });

    // Mise à jour sécurisée du statut uniquement
    if (req.body.status) order.status = req.body.status;

    // Optionnel: permettre mise à jour du statut paiement si besoin
    if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Erreur mise à jour commande', error: error.message });
  }
};

// Annuler une commande (client uniquement sur sa commande)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });

    if (!order.customerId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Accès refusé : annulation non autorisée' });
    }

    order.status = 'annulée';
    // Optionnel: mettre à jour paymentStatus en cas d'annulation
    order.paymentStatus = 'annulé';

    await order.save();
    res.json({ message: 'Commande annulée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur annulation commande', error: error.message });
  }
};

