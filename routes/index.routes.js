const router = require("express").Router();

const appointmentRouter = require(("./appointment.routes"))
router.use("/appointment", appointmentRouter)

const serviceRouter = require(("./service.routes"))
router.use("/service", serviceRouter)

const userRoutes = require(("./user.routes"))
router.use("/user", userRoutes)

module.exports = router;