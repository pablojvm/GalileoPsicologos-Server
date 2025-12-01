import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true },
  password: { 
    type: String, 
    required: true },
  role: { 
    type: String, 
    enum: ["psychologist", "patient"], 
    required: true },
  specialist: {
    type: String,
    enum: ["Antonio", "Marta"],
    required: function() { return this.role === "psychologist"; }
  },
  appointments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Appointment" }]
}, { timestamps: true });

// Hash de contraseña
userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);