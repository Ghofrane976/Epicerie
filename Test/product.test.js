const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../server');

const User = require('../model/user');
const Store = require('../model/store');
const Product = require('../model/product');

describe('Test produits', () => {
  let token;
  let user;
  let store;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();

    const hashedPassword = await bcrypt.hash('testpassword', 10);

    user = await User.create({
      email: 'user@test.com',
      username: 'testuser',
      password: hashedPassword,
      role: 'user',
    });

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    store = await Store.create({
      name: 'Store test',
      owner: user._id,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Ajouter un produit', async () => {
    const res = await request(app)
      .post('/api/products/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Produit test',
        price: 9.99,
        description: 'Produit test description',
        stock: 10,
        category: 'test',
        imageUrl: 'http://exemple.com/image.jpg',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Produit test');
  });
});
