console.log("auth routes chargées");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Poste = require("../models/Poste");
const Prestataire = require("../models/Prestataire");




// Inscription
router.post("/signup", async (req, res) => {
  const { nom, prenom, dateNaissance, genre, telephone, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nom, prenom, dateNaissance, genre, telephone, email, password: hashedPassword, role
    });

    await newUser.save();
    console.log("Utilisateur sauvegardé :", newUser); // 🔍 debug
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
     console.error("Erreur dans /signup:", error); // <= ajoute ceci
    res.status(500).json({ message: "Erreur serveur" });
    
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Tentative de connexion pour :", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Mot de passe incorrect");
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    console.log("Connexion réussie");
    return res.status(200).json({ 
      message: "Connexion réussie", 
      userId: user._id,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom
    });
    
  } catch (err) {
    console.error("Erreur serveur:", err); 
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/AllPosts", async (req, res) => {
  try {
    const posts = await Poste.find().populate("user", "nom prenom email");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Erreur lors de la récupération des posts :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
/////////

///////

router.get("/recherchePrestataires", async (req, res) => {
  const { keyword, location } = req.query; // Paramètres reçus dans l'URL

  try {
    // Construction du filtre
    const query = {
      $and: []
    };

    if (keyword) {
      query.$and.push({
        description: { $regex: keyword, $options: "i" }
      });
    }

    if (location) {
      query.$and.push({
        $or: [
          { ville: { $regex: location, $options: "i" } },
          { pays: { $regex: location, $options: "i" } }
        ]
      });
    }

    if (query.$and.length === 0) delete query.$and;

    const prestataires = await Prestataire.find(query).populate("user");

    if (prestataires.length === 0) {
      return res.status(404).json({ message: "Aucun prestataire trouvé" });
    }

    const resultats = prestataires.map((prest) => ({
       id: prest.user._id,
      nom: prest.user.nom,
      prenom: prest.user.prenom,
      profil: prest.user.profil,
      description: prest.description
    }));

    return res.status(200).json(resultats);
  } catch (error) {
    console.error("Erreur lors de la recherche des prestataires:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
});


// router.get("/profilPrestataire/:id", async (req, res) => {
//   try {
//     const prestataire = await Prestataire.findOne({ user: req.params.id }).populate("user");
//     if (!prestataire) return res.status(404).json({ message: "Prestataire non trouvé" });

//     res.json({
//       nom: prestataire.user.nom,
//       prenom: prestataire.user.prenom,
//       profil: prestataire.user.profil,
//       email:prestataire.user.email,
//       genre:prestataire.user.genre,
//       telephone:prestataire.user.telephone,
//       description: prestataire.description,
//       specialite: prestataire.specialite,
//       ville: prestataire.ville,
//       adresse:prestataire.adresse,
//       codePostal:prestataire.codePostal,
//       pays:prestataire.pays,
//       tarifHoraire:prestataire.tarifHoraire,
//       disponibilite:prestataire.disponibilite,
//       siteWeb:prestataire.siteWeb,
//         posts: posts.map(post => ({
//         id: post._id,
//         image: post.image,
//         description: post.description,
//         dateEdition: post.dateEdition
//       }))

//     });
//   } catch (err) {
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });
router.get("/profilPrestataire/:id", async (req, res) => {
  try {
    const prestataire = await Prestataire.findOne({ user: req.params.id }).populate("user");
    if (!prestataire) return res.status(404).json({ message: "Prestataire non trouvé" });

    const posts = await Poste.find({ user: req.params.id });

    res.json({
      nom: prestataire.user.nom,
      prenom: prestataire.user.prenom,
      profil: prestataire.user.profil,
      email: prestataire.user.email,
      genre: prestataire.user.genre,
      telephone: prestataire.user.telephone,
      description: prestataire.description,
      specialite: prestataire.specialite,
      ville: prestataire.ville,
      adresse: prestataire.adresse,
      codePostal: prestataire.codePostal,
      pays: prestataire.pays,
      tarifHoraire: prestataire.tarifHoraire,
      disponibilite: prestataire.disponibilite,
      siteWeb: prestataire.siteWeb,
      posts: posts.map(post => ({
        id: post._id,
        image: post.image,
        description: post.description,
        dateEdition: post.dateEdition
      }))
    });
  } catch (err) {
    console.error("Erreur /profilPrestataire/:id =>", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



module.exports = router; 
