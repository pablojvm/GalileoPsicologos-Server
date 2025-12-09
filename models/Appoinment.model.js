const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    psychologist: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    patient: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    service: { 
      type: String, 
      required: true 
    },
    date: { 
      type: String, // YYYY/MM/DD
      required: true 
    },
    time: { 
      type: String, // HH:MM
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled"], 
      default: "pending" 
    },
    coment: {
      type: String,
    }
  }, 
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
