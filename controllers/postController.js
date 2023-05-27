import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";
import mongoose from "mongoose"

//create

export const createPost = async (req , res) =>{
    const newPost = new PostModel(req.body) 
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost)
    } catch (error) {
        console.log(error)
    }
   
}

export const getPost = async (req , res) =>{
    const id = req.params.id
    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        console.log(error)
    }

}

export const updatePost = async (req , res) =>{
    const postId = req.params.id
    const { userId } = req.body
    try {
        const post = await PostModel.findById(postId)

        if(post.userId === userId) {
            await post.updateOne({
                $set: req.body,
            })
            res.status(200).json("updateOne")
        } else {
            res.status(403).json("Error")    
        }
        // res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)

    }

}

//delete

export const deletePost = async (req , res) =>{
        const id = req.params.id
    const { userId } = req.body

    try {
        const post = await PostModel.findById(id)

        if(post.userId === userId) {
            await post.deleteOne()
            res.status(200).json("Deleted")
        }
        
    } catch (error) {
        console.log(error)
    }
}

export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
    if (post.likes.includes(userId)) {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post disliked");
    } else {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("Post liked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//timeline post
export const getTimelinePost = async (req, res) => {
  const userId = req.params.id
  try {
    const currentUserPosts = await PostModel.find({ userId: userId });

    const followingPosts = await UserModel.aggregate([
      { 
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingPosts",
        },
      },
      {
        $project: {
          followingPosts: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(
      currentUserPosts
        .concat(...followingPosts[0].followingPosts)
        .sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
    );
  } catch (error) {
    res.status(500).json(error);
  }
};