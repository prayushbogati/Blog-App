const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const _ = require("lodash");
const mongoose = require("mongoose");
const { log } = require("console");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/blogDB");

const blogSchema = mongoose.Schema({
    blogTitle: String,
    blogContent: String
})

const blog = mongoose.model("blog", blogSchema);

const defaultSchema = mongoose.Schema({
    title: String,
    content: String
})

const defaultInfo = mongoose.model("defaultInfo", defaultSchema);

const homeData = new defaultInfo({
    title: "Home",
    content: "This is the home content.."
})
const aboutData = new defaultInfo({
    title: "About",
    content: "This is the about content.."
})
const contactData = new defaultInfo({
    title: "Contact",
    content: "This is the contact content.."
})

const defaultItems = [homeData, aboutData, contactData];

(async () => {
    try {
        const count = await defaultInfo.countDocuments({});
        if (count === 0) {
            await defaultInfo.insertMany(defaultItems);
            console.log("Default items inserted.");
        } else {
            console.log("Default items already exist. Skipping insertion.");
        }
    } catch (err) {
        console.error("Error checking/inserting default items:", err);
    }
})();


app.get("/", async (req, res) => {
    const posts = await blog.find({});
    const homePost = await defaultInfo.findOne({ title: "Home" });
    res.render("home", { homeTitle: homePost.title, startingContent: homePost.content, blogContent: posts });
})

app.get("/about", async (req, res) => {
    const aboutPost = await defaultInfo.findOne({ title: "About" });

    res.render("about", { aboutTitle: aboutPost.title, aboutContent: aboutPost.content });
})

app.get("/contact", async (req, res) => {
    const contactPost = await defaultInfo.findOne({ title: "Contact" });
    res.render("contact", { contactTitle: contactPost.title, contactContent: contactPost.content });
})

app.get("/compose", (req, res) => {
    res.render("compose");
})

app.get("/posts/:topic", async (req, res) => {
    const title = _.lowerCase(req.params.topic);
    const posts = await blog.find({});
    const matchedPost = posts.find(posts => {
        return _.lowerCase(posts.blogTitle) === title;
    }
    );
    if (matchedPost) {
        res.render("post", { postTitle: matchedPost.blogTitle, postContent: matchedPost.blogContent, id: matchedPost._id });
    }
    else {
        res.send("data not present!");
    }
})

app.post("/deletePost", async (req, res) => {
    const id = req.body.title;
    await blog.findByIdAndDelete(id);
    res.redirect("/");
})

app.post("/compose", async (req, res) => {
    // const post = {
    //     title: req.body.blogTitle,
    //     content: req.body.blogPost
    // }
    // posts.push(post);
    const post = new blog({
        blogTitle: req.body.blogTitle,
        blogContent: req.body.blogPost
    })
    await post.save();
    res.redirect("/");
})

app.listen(port, () => {
    console.log("app running on port", port);
})