const express = require("express");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

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

        // Check if the user already exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            return res.send("User already exists. Please try a different username.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database
        const newUser = new collection({
            username,
            password: hashedPassword,
            phone,
            email
        });

        await newUser.save();
        res.send("User registered successfully! Redirecting to login...");
        setTimeout(() => res.redirect("/"), 3000); // Redirect to login after 3 seconds
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("An error occurred while signing up.");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user
        const user = await collection.findOne({ username });
        if (!user) {
            return res.send("Username not found!");
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            return res.render("home"); // Assuming there's a home.ejs file
        } else {
            return res.send("Wrong password.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login.");
    }
});

// Start the server
const port = 5008;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
