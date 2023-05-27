import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerUser = async( req, res) =>{

    const salt = await bcrypt.genSalt(10)
    const hashedPaass = await bcrypt.hash(req.body.password , salt )
    req.body.password = hashedPaass
    const newUser = new UserModel(req.body)
    const { username } = req.body
    try {
        const oldUser = await UserModel.findOne({ username })
        if(oldUser){
            return res.status(400).json("User already exists")
        }
        const user = await newUser.save()

        const token = jwt.sign({
            username: user.username,
            id: user._id
        }, process.env.JWT_SEC , { expiresIn: "3h"})

        res.status(200).json({user, token})
    } catch (error) {
        console.log(error)
    }
}


export const loginUser = async( req, res) =>{
    const { username , password } = req.body

    try {
        const user = await UserModel.findOne({ username: username})

        if (user) {
            const valid = await bcrypt.compare(password, user.password)

            if (!valid) {
                res.status(400).json("Not Password")
            } else {
                const token = jwt.sign({
                username: user.username,
                id: user._id
            }, process.env.JWT_SEC , { expiresIn: "3h"})
            res.status(200).json({ user, token})
            }
            // valid ? res.status(200).json(user) : res.status(500).json("Not Password")
        } else {
            res.status(404).json("Not found")
        }
    } catch (error) {
        console.log(error)
    }
}