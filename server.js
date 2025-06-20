require('dotenv').config(); // Charger variables .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Import des routes
const storeRoutes = require('./routes/storeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/product.routes');
const promotionRoutes = require('./routes/promotion.routes');
const orderRoutes = require('./routes/order.routes');
const superAdminRoutes = require('./routes/superadmin.routes'); // <-- Import superadmin

// Utilisation des routes
app.use('/api/stores', storeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/superadmin', superAdminRoutes);  // <-- Route superadmin ajoutée

// Middleware gestion des erreurs
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Erreur serveur',
  });
};

app.use(errorHandler);

// Connexion MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/epicerie';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => {
  console.error('❌ Erreur connexion MongoDB :', err.message);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.send('🚀 API Epicerie - Backend fonctionne !');
});

// Export de l'app pour tests (supertest, etc.)
module.exports = app;

// Démarrage serveur uniquement si lancement direct (pas import dans test)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  });
}

