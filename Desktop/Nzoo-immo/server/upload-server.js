const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/images/spaces');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const fileName = `space-${timestamp}-${randomId}${extension}`;
    
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez PNG, JPG, GIF ou WebP.'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Serveur d\'upload d\'images actif' });
});

// Route pour uploader une image
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    const fileName = req.file.filename;
    const filePath = `/images/spaces/${fileName}`;

    console.log(`✅ Fichier uploadé: ${fileName}`);
    console.log(`📁 Chemin: ${filePath}`);

    res.json({
      success: true,
      fileName: fileName,
      filePath: filePath,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour lister les images
app.get('/images', (req, res) => {
  try {
    const imagesPath = path.join(__dirname, '../public/images/spaces');
    
    if (!fs.existsSync(imagesPath)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(imagesPath);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/images/spaces/${file}`,
        size: fs.statSync(path.join(imagesPath, file)).size
      }));

    res.json({ images });
  } catch (error) {
    console.error('Erreur lors de la liste des images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour supprimer une image
app.delete('/images/:fileName', (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../public/images/spaces', fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Fichier supprimé: ${fileName}`);
      res.json({ success: true, message: 'Fichier supprimé avec succès' });
    } else {
      res.status(404).json({
        success: false,
        error: 'Fichier non trouvé'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Le fichier est trop volumineux. Taille maximum : 5MB'
      });
    }
  }
  
  console.error('Erreur serveur:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur'
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur d'upload démarré sur le port ${PORT}`);
  console.log(`📁 Dossier d'upload: ${path.join(__dirname, '../public/images/spaces')}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app;


