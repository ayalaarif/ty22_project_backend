const mongoose = require("mongoose");
const Prestataire = require("./models/Prestataire");

mongoose.connect("mongodb://localhost:27017/ty22");

const nouveauPrestataire = new Prestataire({
  user: "682f9e7a0e66ef82d4c182da",
  adresse: "123 Rue des Lilas",
  ville: "Dakar",
  codePostal: "10000",
  pays: "Sénégal",
  specialite: "Patissiere",
  description: "Professionnel qualifié avec 10 ans d'expérience dans la fabrication de patisseries locales",
  tarifHoraire: 15000,
  disponibilite: ["Lundi", "Mardi", "Vendredi"],
  siteWeb: "https://patisserie-senegal.com",
  image: null // ou une URL si tu veux
});

nouveauPrestataire.save()
  .then(() => {
    console.log("Prestataire ajouté avec succès !");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Erreur lors de l'ajout :", err);
    mongoose.disconnect();
  });
