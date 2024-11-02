const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // Middleware pour l'authentification
const multer = require('../middlewares/multer-config'); // Middleware pour la gestion des fichiers

const bookCtrl = require('../controllers/book'); // Contrôleur pour les fonctions liées aux livres

// Routes pour les opérations sur les livres
router.get('/', bookCtrl.getAllBooks); // Récupérer tous les livres
router.get('/bestrating', bookCtrl.getBestRatingBook); // Récupérer les livres avec les meilleures notes
router.get('/:id', bookCtrl.getOneBook); // Récupérer un livre par son ID
router.post('/', auth, multer, bookCtrl.createBook); // Créer un nouveau livre (authentifié)

router.delete('/:id', auth, bookCtrl.deleteBook); // Supprimer un livre par son ID (authentifié)
router.put('/:id', auth, multer, bookCtrl.updateBook); // Mettre à jour un livre (authentifié)
router.post('/:id/rating', auth, bookCtrl.rateBook); // Noter un livre (authentifié)

module.exports = router;