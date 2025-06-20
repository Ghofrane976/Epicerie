const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordercontrollers');
const auth = require('../Middleware/authmiddlewares'); // Middleware d'authentification
const adminMiddleware = require('../Middleware/adminMiddleware'); // Middleware pour vérifier rôle admin

// 📦 Client : créer une commande (auth obligatoire)
router.post('/', auth, orderController.createOrder);

// ❌ Client : annuler sa commande (sur sa propre commande uniquement)
router.put('/:id/cancel', auth, orderController.cancelOrder);

// 👁️‍🗨️ Admin : voir toutes les commandes (uniquement celles liées à son store)
router.get('/', auth, adminMiddleware, orderController.getOrders);

// 🔄 Admin : modifier l'état d'une commande (ex: confirmée, livrée), uniquement commande liée à son store
router.put('/:id/status', auth, adminMiddleware, orderController.updateOrder);

module.exports = router;

