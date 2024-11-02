// Middleware pour gérer le téléchargement et la compression d'images

// Import des modules nécessaires
const multer = require("multer"); // Module pour la gestion des fichiers
const sharp = require("sharp"); // Module pour manipuler les images
const fs = require("fs"); // Pour réaliser des opérations sur les fichiers

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); // Répertoire de destination des fichiers
  },

  filename: (req, file, callback) => {
    // Définir comment les noms de fichier sont générés
    const name = file.originalname.split(".")[0]; // Nom du fichier sans extension
    callback(null, name + ".webp"); // Nom avec extension .webp
  },
});

// Création d'un objet multer avec une limite de taille de fichier
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // Taille maximale de 4 Mo
  },
}).single("image");

// Export d'un middleware pour le téléchargement et la compression d'images
module.exports = (req, res, next) => {
  // Modification des permissions du dossier "images"
  fs.chmod("images", 0o755, (err) => {
    if (err) {
      next(err);
      return;
    }

    // Appel du middleware multer pour gérer le téléchargement de l'image
    upload(req, res, async (err) => {
      if (err) {
        const error = new Error(
          "L'image dépasse la taille maximale autorisée (4 Mo)."
        );
        error.statusCode = 400;
        next(error); // Passer au middleware suivant en cas d'erreur
        return;
      }

      try {
        const originalFileName = req.file ? req.file.path : null;

        if (originalFileName) {
          // Utilisation de sharp pour redimensionner et convertir l'image en .webp
          let compressedFileName =
            req.file.path.split(".")[0] + "compressed.webp";
          await sharp(originalFileName)
            .resize(800) // Redimensionnement à 800px
            .webp({ quality: 80 }) // Conversion en .webp avec qualité de 80%
            .toFile(`${compressedFileName}`);

          fs.unlinkSync(originalFileName); // Suppression de l'image d'origine
          fs.renameSync(`${compressedFileName}`, originalFileName); // Renommage de l'image compressée
        }

        next(); // Passer au middleware suivant
      } catch (error) {
        next(error);
      }
    });
  });
};