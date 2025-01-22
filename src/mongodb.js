
const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/LoginSignUpTutorial")
    .then(() => {
        console.log("mongo connected");
})
    .catch(() => {
        console.log("fail to connect");
    }
)
 
const LoginSchema = new mongoose.Schema({
    id: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    name: {
        type: String,
        required:true
    }
})

const collection = new mongoose.model("logincollections", LoginSchema)
module.exports = collection


