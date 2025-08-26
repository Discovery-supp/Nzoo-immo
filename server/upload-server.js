const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/health', (req, res) => res.json({ ok: true }));

// --- AI Chat proxy vers OpenAI ---
app.post('/ai-chat', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY manquant côté serveur' });
    }

    const { history, message } = req.body || {};
    const messages = Array.isArray(history) ? history : [];

    // Construction du prompt: transformer l'historique en format OpenAI
    const chatMessages = [
      { role: 'system', content: 'Tu es un conseiller commercial N\'zoo Immo. Réponds en français avec un ton chaleureux, professionnel et orienté conversion. Mets en avant les bénéfices, la valeur et les garanties. Sois concis, propose systématiquement la prochaine étape (ex: proposer de réserver un créneau, partager une offre adaptée, ou demander un besoin précis: dates, type d\'espace, budget). Reformule les objections de manière empathique et propose une alternative. Évite le jargon, utilise des puces lorsque pertinent, et termine par un appel à l\'action clair.' },
      ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
      { role: 'user', content: message }
    ];

    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.6,
      max_tokens: 500,
    });

    const text = completion.choices?.[0]?.message?.content || "Je n'ai pas de réponse pour le moment.";
    const now = Date.now();
    return res.json({
      message: { id: `m_${now}`, role: 'assistant', content: text, createdAt: now }
    });
  } catch (error) {
    console.error('Erreur /ai-chat:', error);
    return res.status(500).json({ error: 'Erreur lors de la requête OpenAI' });
  }
});

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


