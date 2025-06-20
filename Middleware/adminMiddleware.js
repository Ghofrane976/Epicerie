module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé, utilisateur non admin' });
  }
  next();
};
