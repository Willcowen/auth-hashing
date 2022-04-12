const express = require("express");
//
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";
//
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

const jwtSecret = "mysecretkey";

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, saltRounds);
    const createdUser = await prisma.user.create({
      data: {
        username: username,
        password: hash,
      },
    });
    res.status(200).json("Account created!");
  } catch (e) {
    console.log(e);
    res.status(500).send("Invalid input");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (!foundUser) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const verify = bcrypt.compareSync(req.body.password, foundUser.password);
  if (!verify) {
    res.status(401).json({ error: "Invalid username or password." });
  }
  const token = jwt.sign({ username }, jwtSecret);

  res.json({ data: token });
});

module.exports = router;
