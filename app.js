const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

const port = process.env.PORT || 3000;

// Tells Express to use EJS as it's view engine
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
// Specify CSS location
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true
});


const itemSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


app.get("/", (req, res) => {
    //let day = date.getDate();
    Item.find((err, foundItems) => {
        // Checks if DB is empty
        if (foundItems.length === 0) {
            // Add basic items as todo list tutorial
            Item.insertMany(defaultItems, (err) => {
                // ItemModel.insertMany(defaultItems, (err) => { (err) ? console.log(err) : console.log("Succesfully saved defaults items to DB.") });;
                if (err)
                    console.log(err);
                else
                    console.log("Sucessfully saved default items to DB!");
            });
            // After adding 3 basic items, redirects to show them
            res.redirect("/");
        } else {
            // DB is not empty
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            })
        }
    });
});

// Checks to see if an existing list route exists on DB and creates a new one if it doesn't
app.get("/:customListName", (req, res) => {

    const customListName = _.capitalize(req.params.customListName);


    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            // If foundList doesn't exist creates a new custom list and populates it with default tutorial items
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                // Redirect to search for and find new list page
                res.redirect("/" + customListName);
            } else {
                // Render an existing list
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                })
            }
        }
    })
});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    // Saves the new item on the DB and redirect to home route
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        // On the home page it can delete directly since its from Item Schema
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("Sucessfully deleted checked item.");
                res.redirect("/");
            }
        });
    } else {
        // Search for the list of listName then uses $pull to remove from an array inside the document
        // It's going to pull from the items array inside a List document if the _id corresponds to the checked item id
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, (err) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

app.listen(port, () => {
    console.log("Server is runnin on port " + port);
});