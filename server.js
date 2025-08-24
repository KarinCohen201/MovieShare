require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const adminRoutes = require("./routes/admin"); 
const authRouter = require('./routes/authentication')
const favoritesRouter = require('./routes/favorites')
const reviewRouter = require('./routes/reviews')
const linksRouter = require("./routes/links");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Client"), { index: false }));



// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "home.html"));
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "home.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "register.html"));
});

app.get("/details", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "details.html"));
});

app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "index.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "admin.html")); 
});

app.get("/favoritesMovies", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "favorites.html")); 
});

app.get("/publicMovies", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "publicMovies.html")); 
});


//use login, register, logout, get-username
app.use(authRouter)
//use add-favorite, remove-favorite, is-favorite, favorites
app.use(favoritesRouter)

app.use("/links", linksRouter);
app.use("/reviews", reviewRouter);

app.use(express.json());
app.use("/admin", adminRoutes);

// Check User Session
app.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

