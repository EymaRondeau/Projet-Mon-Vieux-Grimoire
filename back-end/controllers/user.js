const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

exports.signup = (req, res, next) => {
  // Hash du mot de passe utilisateur
  bcrypt
    .hash(req.body.password, 10) // Le nombre 10 est le "salt rounds" pour renforcer le hash
    .then((hash) => {
      // Création d'un nouvel utilisateur avec l'e-mail et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Enregistrer l'utilisateur dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // Réponse en cas de succès
        .catch((error) => res.status(400).json({ error })); // Réponse en cas d'erreur (e.g., e-mail déjà utilisé)
    })
    .catch((error) => res.status(500).json({ error })); // Erreur lors du hashage
};

exports.login = (req, res, next) => {
  // Rechercher l'utilisateur dans la base de données par son e-mail
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" }); // Erreur si utilisateur non trouvé
      }
      // Comparer le mot de passe fourni avec le hash stocké
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" }); // Erreur si mot de passe incorrect
          }
          // Génération d'un token JWT pour l'authentification
          const token = jwt.sign(
            { userId: user._id }, // Données encodées dans le token
            process.env.JWT_SECRET // Clé secrète utilisée pour signer le token
          );
          // Réponse avec l'ID utilisateur et le token d'authentification
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => res.status(500).json({ error })); // Erreur lors de la comparaison des mots de passe
    })
    .catch((error) => res.status(500).json({ error })); // Erreur lors de la recherche de l'utilisateur
};