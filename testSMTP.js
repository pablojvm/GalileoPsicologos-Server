import { transporter } from "./config/nodemailer.js"; // ✅ correcto
 // importa tu transporter

transporter.verify((error, success) => {
  if (error) {
    console.error("Error al conectar SMTP:", error);
  } else {
    console.log("Conexión SMTP correcta");
  }
});
