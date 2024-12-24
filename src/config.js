const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const app = express();

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/dental_booking", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { username, password, phone, email } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            username,
            password: hashedPassword,
            phone,
            email
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        console.log("User saved:", savedUser);
        res.status(201).send(`
            <script>
                alert('Successfully registered! Redirecting to login page...');
                window.location.href = "/";
            </script>
        `);
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("An error occurred while signing up");
    }
});

// Start the server
const port = 5008;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
