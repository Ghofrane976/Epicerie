const jwt = require('jsonwebtoken');
const User = require('../model/user');

const userMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ici on suppose que dans le token payload tu as un champ 'id' (à adapter si différent)
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré', error: error.message });
  }
};

module.exports = userMiddleware;



