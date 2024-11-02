const Book = require("../models/Book");
const fs = require('fs'); // Module pour gérer le système de fichiers
const path = require('path'); // Module pour gérer les chemins de fichiers
const multer = require('multer'); // Module pour gérer les téléchargements de fichiers

// Configuration de multer pour gérer le stockage des fichiers téléchargés
const storage = multer.diskStorage({
    // Dossier de destination des fichiers
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'images')); // Dossier "images" à la racine
    },
    // Nommer le fichier avec un timestamp pour éviter les doublons
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage }); // Initialisation de multer

// Fonction pour créer un nouveau livre
exports.createBook = async (req, res, next) => {
    try {
        const userId = req.auth.userId; // ID utilisateur du middleware d'authentification
        const bookObj = JSON.parse(req.body.book); // Données du livre depuis le corps de la requête
        const { title, author, year, genre, ratings } = bookObj;

        let filename = "";
        if (req.file) filename = req.file.filename; // Nom du fichier image si téléchargé

        let averageRating = 0;
        if (ratings.length === 1) averageRating = ratings[0].grade;

        // Création du nouvel objet Book
        const newBook = new Book({
            userId: userId,
            title: title,
            author: author,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`, // URL complète de l'image
            year: year,
            genre: genre,
            ratings: ratings,
            averageRating: averageRating
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook); // Réponse avec le livre créé
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path); // Supprimer l'image si erreur
        res.status(500).json({ message: 'Erreur lors de la création du livre.' });
    }
};

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

// Fonction pour récupérer un livre par ID
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

// Fonction pour supprimer un livre et son image associée
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(foundBook => {
            if (!foundBook) return res.status(404).json({ message: "Livre non trouvé." });

            const fileName = foundBook.imageUrl.split('/').pop(); // Extraire le nom du fichier image
            const imagePath = path.join(__dirname, '..', 'images', fileName);

            fs.unlink(imagePath, (err) => {
                if (err) return res.status(500).json({ error: "Erreur lors de la suppression de l'image." });

                Book.deleteOne({ _id: foundBook._id })
                    .then(() => res.status(200).json({ message: "Livre supprimé avec succès." }))
                    .catch(error => res.status(500).json({ error: "Erreur lors de la suppression du livre." }));
            });
        })
        .catch(error => res.status(500).json({ error: "Erreur lors de la recherche du livre." }));
};

// Fonction pour mettre à jour un livre
exports.updateBook = (req, res, next) => {
    const bookId = req.params.id;
    const updatedBookData = req.body;

    Book.findById(bookId)
        .then(foundBook => {
            if (!foundBook) return res.status(404).json({ message: "Livre non trouvé." });

            foundBook.title = updatedBookData.title || foundBook.title;
            foundBook.author = updatedBookData.author || foundBook.author;
            foundBook.year = updatedBookData.year || foundBook.year;
            foundBook.genre = updatedBookData.genre || foundBook.genre;

            if (req.file) {
                if (foundBook.imageUrl) {
                    const fileName = foundBook.imageUrl.split('/').pop();
                    const imagePath = path.join(__dirname, '..', 'images', fileName);
                    fs.unlinkSync(imagePath); // Supprimer l'ancienne image
                }
                foundBook.imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`; // URL de la nouvelle image
            }

            foundBook.save()
                .then(updatedBook => res.status(200).json({ message: "Livre mis à jour avec succès.", updatedBook }))
                .catch(error => res.status(500).json({ error: "Erreur lors de la mise à jour du livre." }));
        })
        .catch(error => res.status(500).json({ error: "Erreur lors de la recherche du livre." }));
};

// Fonction pour noter un livre
exports.rateBook = async (req, res, next) => {
    const bookId = req.params.id;
    const { rating, userId } = req.body;

    try {
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
        }

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Livre non trouvé.' });

        const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);
        if (existingRatingIndex !== -1) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
        }

        book.ratings.push({ userId, grade: rating });
        const totalRating = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = Math.round(totalRating / book.ratings.length);

        await book.save();
        res.status(200).json({ message: 'Note du livre mise à jour avec succès.', book });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la notation du livre.' });
    }
};

// Fonction pour récupérer les trois livres les mieux notés
exports.getBestRatingBook = (req, res, next) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestBooks => res.status(200).json(bestBooks))
        .catch(error => res.status(500).json({ error: "Erreur lors de la récupération des meilleurs livres." }));
};