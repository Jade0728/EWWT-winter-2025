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
        name:req.body.name
    }
    
    await collection.insertMany([data])
    
     res.render("home")
    

})
app.post("/login", async (req, res) => {
    try {
        const check=await collection.findOne({id:req.body.id})
        if (check.password === req.body.password) {
            res.render("home")
        }
        else {
            res.json({message: "wrong password" });
        }
    }   
    catch {
        res.json({ message: "wrong id" });
        
    }
})
app.listen(3000, () => {
    console.log("port connected");
})
