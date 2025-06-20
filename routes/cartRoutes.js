const express = require('express');
const router = express.Router();

const Cart = require('../model/cart');
const Product = require('../model/product');
const userMiddleware = require('../Middleware/userMiddleware');

// Test route
router.get('/test', userMiddleware, (req, res) => {
  res.json({ message: 'Route panier test OK', userId: req.user._id });
});

// Ajouter un produit au panier
router.post('/add', userMiddleware, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{ productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
});

// Voir le panier
router.get('/', userMiddleware, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    res.json(cart || { items: [] });
  } catch (err) {
    next(err);
  }
});

// Supprimer un produit du panier
router.delete('/remove/:productId', userMiddleware, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Panier non trouvé' });

    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
