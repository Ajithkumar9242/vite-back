import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import authRoute from "./routes/authRoutes.js"
import userRoute from "./routes/userRoute.js"
import postRoute from "./routes/postRoutes.js"
// import uploadRoute from './routes/uploadRoute.js'
import UploadRoute from "./routes/UploadRoute.js"
const PORT= process.env.PORT || 4000

const app = express()
app.use(cors())
app.use(bodyParser.json())


app.use(express.static('public')); 
app.use('/images', express.static('images'));
// app.use("/images", express.static("images"))
// app.use(bodyParser.urlencoded())

mongoose.connect(process.env.MONGO_URI)
.then((suc) =>{
    console.log(`Connected`)
})
.catch((error) =>{
    console.log(error)
})

app.use("/auth", authRoute)
app.use("/user", userRoute)
app.use("/post", postRoute)
app.use("/upload", UploadRoute)

app.listen(PORT, () =>{
    console.log(`Server Started At ${PORT}`)
})