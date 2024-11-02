const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Plugin pour valider l'unicité des champs

// Définition du schéma de données pour un utilisateur
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // S'assure que chaque e-mail est unique
        validate: {
            validator: function(v) {
                // Regex pour valider le format de l'e-mail
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} n'est pas un e-mail valide !` // Message d'erreur personnalisé
        }
    },
    password: { type: String, required: true } // Mot de passe haché de l'utilisateur
});

// Application du plugin pour assurer l'unicité de l'email
userSchema.plugin(uniqueValidator);

const User = mongoose.model('User', userSchema);

module.exports = User;