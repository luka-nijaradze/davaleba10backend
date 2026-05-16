const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const Post = require("./post.model");
const User = require("../users/user.model");

router.post("/", isAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: post._id },
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) {
      return res.status(404).json({ message: "not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "not your post" });
    }

    const { title, content } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "not your post" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { posts: post._id },
    });

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
