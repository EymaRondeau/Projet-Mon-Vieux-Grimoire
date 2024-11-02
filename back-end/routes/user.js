const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user'); // Contrôleur pour les fonctions d'authentification

// Route pour l'inscription d'un nouvel utilisateur
router.post('/signup', userCtrl.signup);

// Route pour la connexion d'un utilisateur existant
router.post('/login', userCtrl.login);

module.exports = router;