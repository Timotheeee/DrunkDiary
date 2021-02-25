const userController = require("../controllers/userController");
const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    await userController.get(req, res);
});

router.post("/validate", async (req, res) => {
    await userController.login(req, res)
});

router.post("/addBuddy", async (req, res) => {
    await userController.addBuddy(req, res);
});

router.post("/removeBuddy", async (req, res) => {
    await userController.removeBuddy(req,res);
});

router.post("/register", async (req, res) => {
    await userController.register(req, res);
});

router.post("/update", async (req, res) => {
    await  userController.update(req, res);
});

module.exports = router;
