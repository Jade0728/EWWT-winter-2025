const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose"); // mongoose 불러오기
const collection = require("./mongodb");
const Group = require("./groupModel");
const bodyParser = require("body-parser");
const session = require("express-session"); // express-session 모듈 추가

const tempelatePath = path.join(__dirname, "../tempelates");
const publicPath = path.join(__dirname, "../public");
const picturePath = path.join(__dirname, "../picture");

app.use(express.json());
app.use(express.static(publicPath));
app.use(express.static(picturePath));

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 세션 설정
app.use(
  session({
    secret: "your_secret_key", // 비밀 키
    resave: false,
    saveUninitialized: true,
  })
);

// 몽고디비 연결 (로그인 및 그룹 데이터 통합)
mongoose.connect("mongodb://localhost:27017/LoginSignUpTutorial", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 첫 화면은 로그인 페이지로 리다이렉트
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home");
  }
  res.render("login");
});

// 홈 페이지
app.get("/home", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  }

  try {
    const groups = await Group.find(); // MongoDB에서 그룹 목록 불러오기
    res.render("home", { user: req.session.user, groups }); // 그룹 목록과 사용자 정보를 home 템플릿으로 전달
  } catch (error) {
    console.error(error);
    res.status(500).send("서버 오류 발생");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

// 회원가입
app.post("/signup", async (req, res) => {
  const data = {
    id: req.body.id,
    password: req.body.password,
    name: req.body.name,
  };

  await collection.insertMany([data]);
  res.redirect("/login"); // 회원가입 후 로그인 페이지로 리다이렉트
});

// 로그인
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ id: req.body.id });
    if (check.password === req.body.password) {
      req.session.user = check; // 로그인한 사용자 정보 세션에 저장
      res.redirect("/home"); // 로그인 후 홈 페이지로 리다이렉트
    } else {
      res.json({ message: "wrong password" });
    }
  } catch {
    res.json({ message: "wrong id" });
  }
});

// 회원탈퇴
app.post("/delete", async (req, res) => {
  try {
    const { id, password } = req.body; // 클라이언트로부터 ID와 비밀번호를 받음

    // 사용자 인증 확인 (ID와 비밀번호 검증)
    const user = await collection.findOne({ id: id });
    if (!user) {
      return res.json({ message: "User not found" });
    }
    if (user.password !== password) {
      return res.json({ message: "Incorrect password" });
    }

    // 사용자를 삭제
    await collection.deleteOne({ id: id });

    // 세션 종료 후 로그인 페이지로 리다이렉트
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("/home");
      }
      res.redirect("/login");
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

// 그룹 추가 라우터
app.post("/add-group", async (req, res) => {
  const { groupName, id, password, name } = req.body;

  try {
    const newGroup = new Group({
      name: groupName,
    });

    await newGroup.save();
    const groups = await Group.find({});

    res.render("home", { user: req.session.user, groups }); // 사용자 정보와 그룹 목록 전달
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding group");
  }
});

app.listen(3000, () => {
  console.log("port connected");
});
