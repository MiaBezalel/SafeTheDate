import express from "express"

const router = express.Router()

// health check for Gateway
router.get("/", (req, res) => {
  res.send("Server is up and running")
})

export default router
