require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user'); // Routes pour l'authentification des utilisateurs
const bookRoutes = require('./routes/book'); // Routes pour les opérations sur les livres
const path = require('path');
const app = express();

app.use(express.json()); // Middleware pour parser les requêtes JSON

// Connexion à MongoDB avec l'URL sécurisée
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Configuration des en-têtes CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Routes pour l'authentification (inscription et connexion)
app.use('/api/auth', userRoutes);

// Routes pour les livres
app.use('/api/books', bookRoutes);

// Servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;