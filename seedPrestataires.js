const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Prestataire = require("./models/Prestataire");
const Post = require("./models/Poste");

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/ty22")
.then(async () => {
  console.log("✅ MongoDB connecté");


const user = new User({
  nom: "Yasmine",
  prenom: "Boukhalfa",
  dateNaissance: new Date("1992-07-18"),
  genre: "Femme",
  telephone: "0601234567",
  email: "yasmine.patisserie@example.com",
  password: await bcrypt.hash("Yasmine", 10),
  profil: "/profils/amina.jpg", // image dans public/images/
  role: "professionnel"
});
await user.save();

const prestataire = new Prestataire({
  user: user._id,
  adresse: "12 rue des délices",
  ville: "Nice",
  codePostal: "06000",
  pays: "France",
  specialite: "Pâtisserie",
  description: "Chef pâtissière diplômée, passionnée par les desserts créatifs et faits maison.",
  tarifHoraire: 35,
  disponibilite: ["Mardi", "Jeudi", "Dimanche"],
  siteWeb: "https://yasminepatisserie.com"
});
await prestataire.save();

const post = new Post({
  user: user._id,
  image: "/posts/Tarte-au-chocolat-et-fruits-rouges.jpg", // image locale dans public/posts/
  description: "Mes dernières créations : tartelettes aux fruits rouges 🍓 et entremets au chocolat noir 🍫 !"
});
await post.save();

  console.log("📸 Post créé :", post.description);

  console.log("✅ Données de test insérées avec succès.");
  mongoose.disconnect();
})
.catch((err) => {
  console.error("❌ Erreur MongoDB :", err);
});


  // Étape 1 : créer un utilisateur professionnel
//   const hashedPassword = await bcrypt.hash("test1234", 10);
//   const user = new User({
//     nom: "Fatima",
//     prenom: "Benali",
//     dateNaissance: new Date("1995-03-15"),
//     genre: "Femme",
//     telephone: "0606060606",
//     email: "fatima@exemple.com",
//     password: hashedPassword,
//     profil: "https://randomuser.me/api/portraits/women/68.jpg", // lien image profil
//     role: "professionnel",
//   });
//   await user.save();

//   console.log("👩‍💼 Utilisateur créé :", user.email);

//   // Étape 2 : créer un prestataire lié à cet utilisateur
//   const prestataire = new Prestataire({
//     user: user._id,
//     adresse: "15 rue des artisans",
//     ville: "Paris",
//     codePostal: "75010",
//     pays: "France",
//     specialite: "Coiffure",
//     description: "Coiffeuse spécialisée en cheveux bouclés",
//     tarifHoraire: 45,
//     disponibilite: ["Lundi", "Mercredi", "Samedi"],
//     siteWeb: "https://fatimacoiffure.fr"
//   });
//   await prestataire.save();

//   console.log("🏢 Prestataire ajouté :", prestataire.specialite);

//   // Étape 3 : créer un post lié à cet utilisateur
//   const post = new Post({
//     user: user._id,
//     image: "https://source.unsplash.com/featured/?haircut",
//     description: "Nouveau look spécial printemps 🌸"
//   });
//   await post.save();

//   console.log("📸 Post créé :", post.description);

//   console.log("✅ Données de test insérées avec succès.");
//   mongoose.disconnect();
// })
// .catch((err) => {
//   console.error("❌ Erreur MongoDB :", err);
// });
