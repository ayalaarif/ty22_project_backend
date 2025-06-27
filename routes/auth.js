console.log("auth routes chargées");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Poste = require("../models/Poste");
const Prestataire = require("../models/Prestataire");
const Review=require("../models/Review");
const Message = require("../models/Message");

const multer = require("multer");
const path = require("path");



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

const removeDiacritics = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Génère des variantes du mot (féminin, pluriel...)
const addGenderAndPluralVariants = (word) => {
  return [
    word,
    word + "e",
    word + "s",
    word + "es",
    word + "ne",
    word + "nes",
  ];
};

router.get("/recherchePrestataires", async (req, res) => {
  const { keyword, location } = req.query;

  try {
    const query = { $and: [] };

    // Traitement du mot-clé
    if (keyword) {
      const sanitizedKeyword = removeDiacritics(keyword.toLowerCase());
      const variants = addGenderAndPluralVariants(sanitizedKeyword);

      // Crée un tableau de conditions avec $regex
      const regexConditions = variants.map((variant) => {
        const regex = new RegExp(variant, "i");
        return {
          $or: [
            { description: { $regex: regex } },
            { specialite: { $regex: regex } },
          ],
        };
      });

      query.$and.push({ $or: regexConditions });
    }

    // Traitement de la localisation
    if (location) {
      query.$and.push({
        $or: [
          { ville: { $regex: location, $options: "i" } },
          { pays: { $regex: location, $options: "i" } },
        ],
      });
    }

    if (query.$and.length === 0) delete query.$and;

    const prestataires = await Prestataire.find(query).populate("user");

    if (!prestataires.length) {
      return res.status(404).json({ message: "Aucun prestataire trouvé" });
    }

    const resultats = prestataires.map((prest) => ({
      id: prest.user._id,
      nom: prest.user.nom,
      prenom: prest.user.prenom,
      profil: prest.user.profil,
      description: prest.description,
      specialite: prest.specialite,
    }));

    return res.status(200).json(resultats);
  } catch (error) {
    console.error("Erreur lors de la recherche des prestataires:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la recherche." });
  }
});


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
      description2: prestataire.description2,
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

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    let prestataireData = null;
    let posts = [];

    if (user.role === "professionnel") {
      prestataireData = await Prestataire.findOne({ user: user._id }).lean();

      if (prestataireData) {
        posts = await Poste.find({ user: user._id }).lean();
      }
    }

    res.status(200).json({
      user,
      prestataire: prestataireData,
      posts,
    });
  } catch (err) {
    console.error("Erreur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Configuration de multer pour l'upload local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.put("/user/:id", upload.single("profil"), async (req, res) => {
  try {
    const userId = req.params.id;

    const userData = JSON.parse(req.body.user);
    const prestataireData = req.body.prestataire ? JSON.parse(req.body.prestataire) : null;

    if (req.file) {
      userData.profil = `uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

    if (updatedUser.role === "professionnel" && prestataireData) {
      await Prestataire.findOneAndUpdate(
        { user: userId },
        { ...prestataireData, user: userId }, // 👈 s’assurer de lier à l’utilisateur
        { new: true, upsert: true } // ✅ crée si inexistant
      );
    }

    res.status(200).json({ message: "Profil mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { description, userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image requise" });
    }

    const post = new Poste({
      description,
      image: `uploads/${req.file.filename}`,
      user: userId,
    });

    await post.save();
    res.status(201).json({ message: "Post ajouté avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du post :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// GET un post
router.get("/post/:id", async (req, res) => {
  try {
    const post = await Poste.findById(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération du post" });
  }
});



router.put("/post/:id", upload.single("image"), async (req, res) => {
  try {
    const postId = req.params.id;
    const data = { description: req.body.description };

    if (req.file) {
      data.image = `uploads/${req.file.filename}`;
    }

    await Poste.findByIdAndUpdate(postId, data);
    res.status(200).json({ message: "Post modifié avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du post" });
  }
});

router.delete("/post/:id", async (req, res) => {
  try {
    await Poste.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/favoris/:clientId/:proId", async (req, res) => {
  try {
    const { clientId, proId } = req.params;

    const client = await User.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client introuvable" });

    if (!client.favoris.includes(proId)) {
      client.favoris.push(proId);
      await client.save();
    }

    res.status(200).json({ message: "Ajouté aux favoris" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Retourne la liste des favoris d'un utilisateur
router.get("/favoris1/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json([]);
    res.json(user.favoris || []);
  } catch (err) {
    res.status(500).json([]);
  }
});

// Retourne les professionnels favoris avec leur description prestataire
router.get("/favoris/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("favoris", "nom prenom profil");

    if (!user) return res.status(404).json([]);

    // Pour chaque professionnel, récupérer aussi sa description prestataire
    const favorisWithDetails = await Promise.all(
      user.favoris.map(async (pro) => {
        const prestataire = await Prestataire.findOne({ user: pro._id });
        return {
          _id: pro._id,
          nom: pro.nom,
          prenom: pro.prenom,
          profil: pro.profil,
          description: prestataire?.description || "Pas de description",
        };
      })
    );

    res.json(favorisWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});


router.delete("/favoris/:userId/:prestataireId", async (req, res) => {
  const { userId, prestataireId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.favoris = (user.favoris || []).filter(id => id.toString() !== prestataireId);
    await user.save();

    res.status(200).json({ message: "Favori retiré avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// GET nombre de favoris
router.get("/favoris/count/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    let count = 0;

    if (user.role === "client") {
      // nombre de professionnels que le client a mis en favoris
      count = user.favoris?.length || 0;
    } else if (user.role === "professionnel") {
      // nombre de clients qui ont mis CE professionnel en favoris
      count = await User.countDocuments({ favoris: userId });
    }

    res.status(200).json({ count });
  } catch (error) {
    console.error("Erreur lors du comptage des favoris:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/top-prestataires", async (req, res) => {
  try {
    const top = await User.aggregate([
      { $unwind: "$favoris" },
      { $group: { _id: "$favoris", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "prestataire"
        }
      },
      { $unwind: "$prestataire" },
      {
        $lookup: {
          from: "prestataires",
          localField: "_id",
          foreignField: "user",
          as: "details"
        }
      },
      { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: "$prestataire._id",
          nom: "$prestataire.nom",
          prenom: "$prestataire.prenom",
          profil: "$prestataire.profil",
          description: "$details.description"
        }
      }
    ]);

    res.json(top);
  } catch (err) {
    console.error("Erreur top prestataires:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/reviews", async (req, res) => {
  const { contenu, auteur, destinataire } = req.body;

  if (!contenu || !auteur || !destinataire) {
    return res.status(400).json({ message: "Champs requis manquants" });
  }

  try {
    const newReview = new Review({ contenu, auteur, destinataire });
    await newReview.save();
    console.log("Review sauvegardée :", newReview); // 🔍 debug
    res.status(201).json(newReview);
  } catch (err) {
    console.error("Erreur lors de la création du review :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post('/messages', async (req, res) => {
  const { contenu, auteur, destinataire } = req.body;

  if (!contenu || !auteur || !destinataire) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    // Enregistrez le message dans la base de données
    const message = new Message({
      contenu,
      auteur,
      destinataire,
      dateEnvoi: new Date(),
    });

    await message.save();

    // Répondre avec un message de succès
    return res.status(201).json({ success: 'Message envoyé avec succès!' });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    return res.status(500).json({ error: "Une erreur est survenue lors de l'envoi du message" });
  }
});

// GET les avis reçus ou envoyés selon le rôle
router.get("/reviews/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    let reviews;

    if (user.role === "professionnel") {
      // Avis reçus
      reviews = await Review.find({ destinataire: userId })
        .populate("auteur", "nom prenom profil")
        .sort({ createdAt: -1 });
    } else {
      // Avis envoyés
      reviews = await Review.find({ auteur: userId })
        .populate("destinataire", "nom prenom profil")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Erreur lors de la récupération des avis :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get("/contacts/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupérer tous les messages où l'utilisateur est soit auteur, soit destinataire
    const messages = await Message.find({
      $or: [
        { auteur: userId },
        { destinataire: userId }
      ]
    }).populate("auteur destinataire");

    const contactMap = {};

    messages.forEach((msg) => {
      let contactUser;
      // Si l'utilisateur est l'auteur, le contact est le destinataire
      if (msg.auteur._id.toString() === userId) {
        contactUser = msg.destinataire;
      } else {
        contactUser = msg.auteur;
      }

      if (contactUser && !contactMap[contactUser._id.toString()]) {
        contactMap[contactUser._id.toString()] = {
          _id: contactUser._id,
          nom: contactUser.nom,
          prenom: contactUser.prenom,
          profil: contactUser.profil,
        };
      }
    });

    const uniqueContacts = Object.values(contactMap);
    res.json(uniqueContacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors du chargement des contacts." });
  }
});

router.get("/messages/conversation/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    // Récupérer tous les messages entre les deux utilisateurs
    const messages = await Message.find({
      $or: [
        { auteur: userId, destinataire: contactId },
        { auteur: contactId, destinataire: userId }
      ]
    }).populate("auteur destinataire"); // Populate pour récupérer les détails des utilisateurs

    // Retourner les messages triés par date de création (ascendant)
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(messages); // Renvoie les messages à l'utilisateur
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la récupération des messages." });
  }
});

router.get('/avis/count/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let count = 0;

    if (user.role === "professionnel") {
      // Compter les avis reçus
      count = await Review.countDocuments({ destinataire: userId });
    } else if (user.role === "client") {
      // Compter les avis envoyés
      count = await Review.countDocuments({ auteur: userId });
    }

    res.json({ count });
  } catch (err) {
    console.error("Erreur lors du comptage des avis :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    // 1. Compter les professionnels
    const professionnelsCount = await User.countDocuments({ role: "professionnel" });

    // 2. Récupérer toutes les spécialités distinctes
    const specialites = await Prestataire.distinct("specialite");
    const specialiteCount = specialites.length;

    res.json({
      professionnelsCount,
      specialiteCount,
      specialites, // optionnel : retourne aussi la liste des spécialités
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router; 
