const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Poste = require("./models/Poste");
const Prestataire = require("./models/Prestataire");

const app = express();

// Configuration CORS
const corsOptions = {
  origin: "http://localhost:3000", // Frontend URL
  credentials: true, // Permet d'envoyer les cookies de session
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Appliquer CORS globalement
app.use(cors(corsOptions));

// Middleware pour parser les requêtes JSON
app.use(express.json());
// 👉 Pour servir les images uploadées
app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/ty22", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Utiliser les routes importées
app.use("/api", require("./routes/auth"));

// Lancer le serveur sur le port 3001
app.listen(3001, () => {
  console.log("Serveur is running on http://localhost:3001");
});
