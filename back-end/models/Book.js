const mongoose = require('mongoose');

// Définition du schéma de données pour un livre
const bookSchema = mongoose.Schema({
    userId: { type: String, required: true }, // ID de l'utilisateur ayant ajouté le livre
    title: { type: String, required: true }, // Titre du livre
    author: { type: String, required: true }, // Auteur du livre
    imageUrl: { type: String, required: true }, // URL de l'image associée au livre
    year: { type: Number, required: true }, // Année de publication
    genre: { type: String, required: true }, // Genre du livre
    ratings: [
        {
            userId: { type: String, required: true }, // ID de l'utilisateur ayant noté le livre
            grade: { type: Number, required: true } // Note attribuée par l'utilisateur
        }
    ],
    averageRating: { type: Number, required: true } // Note moyenne du livre
});

module.exports = mongoose.model('Book', bookSchema);