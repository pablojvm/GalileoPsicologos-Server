import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  psychologist: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true },
  service: { 
    type: String, 
    required: true },
  date: { 
    type: Date, 
    required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled"], 
    default: "pending" }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);