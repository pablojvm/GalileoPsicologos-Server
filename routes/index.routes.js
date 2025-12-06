const router = require("express").Router();

const appointmentRouter = require(("./appointment.routes"))
router.use("/appointment", appointmentRouter)

const authRouter = require(("./auth.routes"))
router.use("/auth", authRouter)

const reviewRouter = require(("./review.routes"))
router.use("/review", reviewRouter)

const emailRouter = require(("./email.routes"))
router.use("/email", emailRouter)

const serviceRouter = require(("./service.routes"))
router.use("/service", serviceRouter)

const userRoutes = require(("./user.routes"))
router.use("/user", userRoutes)

module.exports = router;