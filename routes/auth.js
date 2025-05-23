console.log("auth routes chargées");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");




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

// Connexion
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: "1h"
//     });

//     res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });

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
    return res.status(200).json({ message: "Connexion réussie" });
  } catch (err) {
    console.error("Erreur serveur:", err); // ← CE LOG EST ESSENTIEL
    return res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
