const mongoose = require("mongoose");
const Prestataire = require("./models/Prestataire"); // adapte le chemin si nécessaire

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/ty22", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("Connecté à MongoDB");

  // Mise à jour des documents
  await Prestataire.updateMany(
    { description2: { $exists: false } },
    { $set: { description2: "" } }
  );

  console.log("Champs description2 ajoutés avec succès");

  mongoose.disconnect();
})
.catch(err => {
  console.error("Erreur de connexion :", err);
});
