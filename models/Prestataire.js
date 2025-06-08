const mongoose = require("mongoose");

const prestataireSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  codePostal: { type: String, required: true },
  pays: { type: String, required: true },
  specialite: { type: String, required: true },
  description: { type: String },
  tarifHoraire: { type: Number },
  disponibilite: [String],
  siteWeb: { type: String }
});

module.exports = mongoose.model("Prestataire", prestataireSchema);
