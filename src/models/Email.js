// models/Email.js
import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  emailId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Email = mongoose.models.Email || mongoose.model("Email", emailSchema);

export default Email;
