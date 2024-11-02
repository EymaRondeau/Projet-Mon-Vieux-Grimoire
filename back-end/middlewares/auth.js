const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token de l'en-tête d'autorisation
    const token = req.headers.authorization.split(' ')[1];
    // Vérifier et décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Extraire l'ID de l'utilisateur du token décodé
    const userId = decodedToken.userId;
    // Ajouter l'ID de l'utilisateur à l'objet `auth` de la requête pour une utilisation ultérieure
    req.auth = { userId: userId };
    next(); // Passer au middleware suivant
  } catch (error) {
    res.status(401).json({ error }); // Erreur en cas de token invalide
  }
};