import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const getUser = async (req , res) =>{
    const id = req.params.id

    try {
        const user = await UserModel.findById(id)

        const { password , ...other} = user._doc

        if(user){
            res.status(200).json(other)
        }else{
            res.status(404).json("not found")
        }
    } catch (error) {
        console.log(error)
    }
}

//update

export const updateUser = async (req, res) => {
  const id = req.params.id;
  // console.log("Data Received", req.body)
  const { _id, currentUserAdmin, password } = req.body;
  
  if (id === _id) {
    try {
      // if we also have to update password then password will be bcrypted again
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      // have to change this
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_SEC,
        { expiresIn: "3h" }
      );
      console.log({user, token})
      res.status(200).json({user, token});
    } catch (error) {
      console.log("Error ", error)
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("Access Denied! You can update only your own Account.");
  }
};

//delete

export const deleteUser = async (req , res) =>{
    const id = req.params.id
    const { currentUserId, currentuserAdminStatus } = req.body

    if (currentUserId === id || currentuserAdminStatus) {
        try {
           await UserModel.findByIdAndDelete(id)
            res.status(200).json("Deleted")

        }catch{
            res.status(500).json("not authenticated")

        }
    }
    else{
                res.status(500).json("not authenticated")

        }
}


//follow
export const followUser = async (req , res) =>{
    const id = req.params.id
    const { _id } = req.body
    if (_id === id) {
       res.status(403).json("Forbidden")
    }else{
        try {
            const followUser = await UserModel.findById(id)
            const followingUser = await UserModel.findById(_id)

            if (!followUser.followers.includes(_id)) {
                await followUser.updateOne({
                    $push: { followers: _id}
                })

                await followingUser.updateOne({
                    $push: { following: id}
                })
                res.status(200).json("User followed")
            }else{
       res.status(403).json("Already following")

            }
        } catch (error) {
            console.log(error)
        }
    }
}


//unfollow
export const unFollowUser = async (req , res) =>{
    const id = req.params.id
    const { _id } = req.body
    if (_id === id) {
       res.status(403).json("Forbidden")
    }else{
    try {
            const followUser = await UserModel.findById(id)
            const followingUser = await UserModel.findById(_id)

            if (followUser.followers.includes(_id)) {
                await followUser.updateOne({
                    $pull: { followers: _id}
                })

                await followingUser.updateOne({
                    $pull: { following: id}
                })
                res.status(200).json("User Not followed")
            }else{
       res.status(403).json("Already following")

            }
        } catch (error) {
            console.log(error)
        }
    }
}


export const getAllUsers = async (req, res) => {

  try {
    let users = await UserModel.find();
    users = users.map((user)=>{
      const {password, ...otherDetails} = user._doc
      return otherDetails
    })
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};