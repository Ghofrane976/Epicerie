const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // 🔗 lien vers le produit
  title: { type: String, required: true },
  description: String,
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);

