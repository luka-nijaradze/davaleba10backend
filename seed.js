const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./users/user.model");
const Post = require("./posts/post.model");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Post.countDocuments();
  if (existing > 0) {
    console.log("DB already has data, skipping seed");
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash("123", 10);

  const user = await User.create({
    name: "Demo User",
    email: "demo@mail.com",
    password: hash,
  });

  const posts = await Post.create([
    { title: "First Post", content: "This is the first dummy post.", author: user._id },
    { title: "Second Post", content: "Another post for testing.", author: user._id },
    { title: "Third Post", content: "One more post to show on the landing page.", author: user._id },
  ]);

  await User.findByIdAndUpdate(user._id, { $push: { posts: { $each: posts.map(p => p._id) } } });

  console.log("Seeded 3 dummy posts — login: demo@mail.com / 123");
  await mongoose.disconnect();
}

seed();
