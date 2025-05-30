const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  dateNaissance: Date,
  genre: String,
  telephone: String,
  email: { type: String, unique: true },
  password: String,
  profil: {
    type: String,
    default: null
  },
  role: { type: String, enum: ["client", "professionnel"], default: "client" }
});

module.exports = mongoose.model("User", userSchema);
