const { Router } = require("express");
const router = Router();
const User = require("../model/User");
const https = require("https");
const axios = require("axios");
const Admin = require("../model/Admin");
router.post("/getSvg", async (req, res) => {
  try {
    const request1 = await axios.get(
      "http://parser-api.com/parser/gibdd_api/?key=4379c0f1c5eca04a475706f7c249b80d&damage_svg=01,08"
    );
    console.log(request1.data);
    res.json({ svgItem: request1.data });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/users", async (req, res) => {
  try {
    console.log("users");
    const users = await User.find({});
    console.log(users);
    res.json({ inform: users });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/deleteUser", async (req, res) => {
  try {
    console.log(req.body);

    await User.findOneAndDelete({ login: req.body.login });
    const findedUsers = await User.find({});
    res.json({ users: findedUsers, message: "Пользователь удален" });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/adminSign", async (req, res) => {
  try {
    const { login, pass } = req.body;
    console.log(req.body);
    const user = await Admin.findOne({ login });
    console.log(user);
    if (!user) {
      console.log("Ошибка с логином");
      return res.status(201).json({ message: "Пользователь не найден" });
    }
    console.log(user);

    const isMatch = pass == user.password;

    if (!isMatch) {
      console.log("Ошибка с паролем");
      return res
        .status(201)
        .json({ message: "Неверный пароль, попробуйте снова" });
    }

    res.status(201).json({ msg: "Успешный вход", inform: user.login });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/getInfromFromVin", async (req, res) => {
  try {
    const { vin } = req.body;
    console.log("sdsd");
    const request1 = await axios.get(
      `https://parser-api.com/parser/gibdd_api/?key=4379c0f1c5eca04a475706f7c249b80d&vin=${vin}`
    );

    const request2 = await axios.get(
      `https://parser-api.com/parser/rsa_api/?key=4379c0f1c5eca04a475706f7c249b80d&vin=${vin}`
    );
    const gibdd = request1.data;
    const rsa = request2.data;
    console.log(gibdd);
    console.log(
      "================================================================"
    );
    let svgResponse;
    if (gibdd.damageSvg) {
      const requestSvg = await axios.get(gibdd.damageSvg);
      svgResponse = requestSvg.data;
    }

    console.log(rsa);
    const errors = [gibdd.error, rsa.error].filter(
      (item) => item != undefined || item != null
    );

    res.json({
      rsa: rsa.policies,
      gibdd: gibdd.accidents,
      svgItem: svgResponse,
      message: errors,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/signAccount", async (req, res) => {
  try {
    console.log(req.bdoy);
    const { login, pass } = req.body;
    console.log(req.body);
    const date = new Date();
    const formattedDate = date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const user = await User.findOne({ login });
    console.log(user);
    if (!user) {
      console.log("Ошибка с логином");
      return res.status(201).json({ message: "Пользователь не найден" });
    }
    console.log(user);

    const isMatch = pass == user.password;

    if (!isMatch) {
      console.log("Ошибка с паролем");
      return res
        .status(201)
        .json({ message: "Неверный пароль, попробуйте снова" });
    }
    await User.updateOne({ login }, { lastEntry: formattedDate });

    res.status(201).json({ msg: "Успешный вход", inform: user.login });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/createAccount", async (req, res) => {
  try {
    console.log(req.body);
    const { login, pass, email, name } = req.body;
    const candidate = await User.findOne({ email });
    console.log(candidate);
    const date = new Date();
    const formattedDate = date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    if (candidate) {
      return res
        .status(201)
        .json({ message: "Такой пользователь уже существует" });
    }

    const user = new User({
      name,
      login,
      password: pass,
      email,
      lastEntry: formattedDate,
    });
    console.log(user);
    await user.save();
    const candidateTwo = await User.findOne({ email });
    console.log(candidateTwo);
    res
      .status(201)
      .json({ msg: "Пользователь создан", inform: candidateTwo.login });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/getReceivedDocs", async (req, res) => {});

module.exports = router;
