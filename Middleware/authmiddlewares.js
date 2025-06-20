const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Assure-toi du bon chemin

module.exports = async (req, res, next) => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  // Extraire token (après 'Bearer ')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Récupérer l'utilisateur complet depuis la DB
    const user = await User.findById(decoded.id || decoded.userId);
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

    req.user = user; // stocke user complet pour accéder à req.user._id etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};
