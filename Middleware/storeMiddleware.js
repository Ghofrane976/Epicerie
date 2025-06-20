// Middleware pour authentifier un vendeur (store)
module.exports = function (req, res, next) {
  // Exemple simple d'authentification basée sur un token dans les headers
  const token = req.headers.authorization;

  if (!token || token !== 'votre-token-de-test') {
    return res.status(401).json({ message: 'Accès non autorisé. Token invalide.' });
  }

  // Pour l'exemple, on ajoute un faux store à req
  req.store = { _id: '1234567890abcdef', name: 'Mon Épicerie' };
  next();
};


