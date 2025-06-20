const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  stock: { type: Number, default: 0 },
  category: String,
  imageUrl: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null }, // référence promotion

  // Nouveau champ pour la validation superadmin
  isValidated: {
    type: Boolean,
    default: false // par défaut, non validé
  }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);


