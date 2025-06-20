const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  totalPrice: Number,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ربط بالعميل
  customerName: String,
  customerPhone: String,
  status: { 
    type: String, 
    enum: ['en attente', 'confirmée', 'livrée', 'annulée'], 
    default: 'en attente' 
  },

  // 🔒 Store lié à cette commande (important pour filtrer par propriétaire)
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },

  // Nouveau : méthode de paiement choisie par le client
  paymentMethod: {
    type: String,
    enum: ['livraison', 'en ligne'], // tu peux ajouter d'autres méthodes si besoin
    default: 'livraison'
  },

  // Nouveau : statut du paiement (utile pour suivi)
  paymentStatus: {
    type: String,
    enum: ['en attente', 'payé', 'annulé'],
    default: 'en attente'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

