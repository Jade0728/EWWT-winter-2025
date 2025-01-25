const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const collection = require("./mongodb")
 
const tempelatePath = path.join(__dirname, '../tempelates')

app.use(express.json())
app.set('view engine', "hbs")
app.set('views', tempelatePath)
app.use(express.urlencoded({extended:false}))
    
app.get("/", (req, res) => {
    res.render("login")
})
app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", async (req, res) => {
    const data = {
        id: req.body.id,
        password: req.body.password,
        name: req.body.name
    };
    
    await collection.insertMany([data]);
    res.render("home", { name: data.name, id: data.id, password: data.password });
});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ id: req.body.id });
        if (check.password === req.body.password) {
            res.render("home", { name: check.name, id: check.id, password: check.password });
        } else {
            res.json({ message: "wrong password" });
        }
    } catch {
        res.json({ message: "wrong id" });
    }
});

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
        res.render("login", { message: "Account deleted successfully" }); // 삭제 후 로그인 페이지로 이동
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});

app.listen(3000, () => {
    console.log("port connected");
})
