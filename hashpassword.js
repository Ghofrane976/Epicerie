const bcrypt = require('bcryptjs');

const password = 'superadmin';  // Remplace par le mot de passe que tu veux hasher

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Erreur de hash:', err);
  } else {
    console.log('Mot de passe hashé :', hash);
  }
});
