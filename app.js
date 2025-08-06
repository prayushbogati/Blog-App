const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const _ = require("lodash");
const mongoose = require("mongoose");
const { log } = require("console");

const app = express();
const port = 3000;
const text1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lobortis tortor quis augue accumsan, sed eleifend lacus consectetur. Aliquam egestas congue eleifend. Vestibulum pellentesque nisi justo, et ultrices metus pulvinar non. Donec elementum, ante a suscipit feugiat, leo quam luctus turpis, a placerat lorem leo pretium mauris. Duis sed sollicitudin lacus. Integer eleifend gravida nunc in efficitur. Suspendisse potenti. Proin leo odio, tempor ut diam in, consectetur ornare quam. Aliquam in dapibus augue. Quisque vulputate tincidunt mattis. Proin et turpis rhoncus, semper sapien nec, pellentesque lorem. Vestibulum lacinia vel sapien a tempus. Curabitur scelerisque, nibh in interdum aliquet, erat turpis sollicitudin velit, eu porta nulla nisi in mi. Nullam posuere orci urna, sit amet tincidunt turpis mollis ac. Aliquam erat volutpat. Sed nec scelerisque arcu.";

const text2 = "Aenean a volutpat ante. Nam eget scelerisque eros. Vivamus mollis massa at orci interdum vulputate. Vivamus dapibus accumsan metus non pellentesque. In ut malesuada magna. Suspendisse pulvinar ex non pellentesque consequat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur at mauris ut eros dictum laoreet mollis eget nisi. Nullam blandit mi libero, vitae imperdiet massa condimentum eget. Sed nibh metus, tristique in eleifend non, vestibulum id ipsum.";

const text3 = "Aliquam dapibus sed mauris vitae sollicitudin. Duis ullamcorper tortor sed odio ullamcorper mollis. Aliquam elementum ante sem, eu iaculis eros accumsan vitae. Donec sodales purus mi, non dignissim nulla laoreet euismod. Nam ultricies odio mauris, vitae malesuada augue rhoncus sit amet. Duis tristique ultricies vulputate. Sed id odio posuere, faucibus magna eu, finibus justo. Quisque ac dolor pellentesque, tristique neque non, accumsan quam. Etiam in arcu vel nisl sollicitudin rhoncus at non leo. Nam id porttitor sapien. Nam auctor, orci in ullamcorper mattis, enim nulla volutpat velit, in pharetra eros augue vitae sem. Donec ut commodo tortor. Vivamus mattis iaculis auctor. Proin porta, quam sodales vulputate tincidunt, ante enim interdum sem, vel auctor lacus elit dignissim erat.";

// const posts = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// app.use((req, res, next) => {
//   console.log(`Request received: ${req.method} ${req.url}`);
//   next(); // Pass control to the next middleware or route handler
// });

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
    // posts.forEach(post => {
    //     const storedTite = _.lowerCase(post.blogTitle);
    if (matchedPost) {
        res.render("post", { postTitle: matchedPost.blogTitle, postContent: matchedPost.blogContent, id: matchedPost._id });
    }
    else {
        res.send("data not present!");
    }
    // }
    // );
})

app.post("/deletePost", async(req, res) => {
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