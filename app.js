const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");

const app = express();

const port = process.env.PORT || 3000;

let items = [];
let itemsWork = [];

// Tells Express to use EJS as it's view engine
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

// Specify CSS location
app.use(express.static("public"));

app.get("/", (req, res) => {
    let day = date.getDate();
    res.render("list", {
        listTitle: day,
        newListItems: items
    });
});

app.get("/work", (req, res) => {
    // Sends a different array and title to be rendered on work route
    res.render("list", {
        listTitle: "Work List",
        newListItems: itemsWork
    })
});

app.get("/about", (req, res) => {
    res.render("about");
});


app.post("/", (req, res) => {
    let item = req.body.newItem;

    // Redirect to home route to render the page with the new item
    if (req.body.list === "Work List") {
        itemsWork.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.listen(port, () => {
    console.log("Server is runnin on port " + port);
});