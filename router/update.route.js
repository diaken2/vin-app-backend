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
    const { vin, login } = req.body;
    console.log("sdsd");
    const user = await User.findOne({ login });
    const now = new Date();

    if (!user.lastRequest || now - user.lastRequest >= 24 * 60 * 60 * 1000) {
      await User.updateOne({ login }, { dailyRequests: 0 });
    }

    if (
      !user.lastRequest ||
      now - user.lastRequest >= 30 * 24 * 60 * 60 * 1000
    ) {
      await User.updateOne({ login }, { monthlyRequests: 0 });
    }
    await User.updateOne({ login }, { dailyRequests: user.dailyRequests + 1 });
    await User.updateOne({ login }, { allRequests: user.allRequests + 1 });
    await User.updateOne(
      { login },
      { monthlyRequests: user.monthlyRequests + 1 }
    );
    await User.updateOne({ login }, { lastRequest: now });

    const request1 = await axios.get(
      `https://parser-api.com/parser/gibdd_api/?key=4379c0f1c5eca04a475706f7c249b80d&vin=${vin}`
    );

    const request2 = await axios.get(
      `https://parser-api.com/parser/rsa_api/?key=4379c0f1c5eca04a475706f7c249b80d&vin=${vin}`
    );
    let gibdd = request1.data.accidents;
    let rsa = request2.data;
    console.log(gibdd);
    console.log(
      "================================================================"
    );

    let newGibdd = await Promise.allSettled(
      gibdd.map(async (item) => {
        if (item.damageSvg) {
          try {
            const requestSvg = await axios.get(item.damageSvg);
            return { ...item, damageSvg: requestSvg.data };
          } catch (error) {
            console.error("Ошибка при получении SVG:", error);
            return { ...item, damageSvgError: error };
          }
        }
        return item;
      })
    );

    newGibdd = newGibdd.map((result) =>
      result.status === "fulfilled" ? result.value : result.reason
    );
    console.log(newGibdd);
    console.log(rsa);
    const errors = [gibdd.error, rsa.error].filter(
      (item) => item != undefined || item != null
    );

    res.json({
      rsa: rsa.policies,
      gibdd: newGibdd,

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
      dailyRequests: 0,
      allRequests: 0,
      monthlyRequests: 0,
      lastRequest: new Date(),
    });
    console.log(user);
    await user.save();
    const candidateTwo = await User.findOne({ email });
    console.log(candidateTwo);
    res.status(201).json({
      msg: "Пользователь создан",
      inform: candidateTwo.login,
    });
  } catch (e) {
    console.log(e);
    return;
  }
});

router.post("/getReceivedDocs", async (req, res) => {});

module.exports = router;
