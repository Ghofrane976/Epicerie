const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');

const User = require('../model/user');
const Store = require('../model/store');
const Product = require('../model/product');
const Order = require('../model/order');

describe('Test de la route commande', () => {
  let token;
  let user;
  let store;
  let product;

  beforeAll(async () => {
    // Nettoyer la base de données de test
    await Order.deleteMany();
    await Product.deleteMany();
    await Store.deleteMany();
    await User.deleteMany();

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('motdepasse123', 10);

    // Créer un utilisateur
    user = await User.create({
      email: 'testclient@example.com',
      username: 'testclient',
      password: hashedPassword,
      role: 'user',
    });

    // Générer un token
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Créer un store
    store = await Store.create({
      name: 'Épicerie Test',
      owner: user._id,
    });

    // Créer un produit
    product = await Product.create({
      name: 'Produit Test',
      price: 5.99,
      stock: 20,
      store: store._id,
      owner: user._id,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Créer une commande (avec token)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        products: [{ productId: product._id, quantity: 2 }],
        totalPrice: 11.98,
        customerName: 'Client Test',
        customerPhone: '555123456',
        store: store._id,
        paymentMethod: 'livraison',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.customerName).toBe('Client Test');
  });
});
