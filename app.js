const express = require("express");
const bodyparser = require("body-parser");
const { name } = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  express.static("public")
); /*if want to load a css file or sounds assets or images or js file just put all the file to 
public named folder so that server can easly load a public folder and then can use files
*/
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//lets create schema for list
const itemSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to  your TO-DO-LIST.",
});

const item2 = new Item({
  name: "Hit the +9 button and add a new item.",
});

const item3 = new Item({
  name: "<--- hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully added the data ");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTittle: "Today", newListitems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  //Lets save item to there own list name page
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/:customListName", function (req, res) {
  //This line will create custom  pages that we want to create

  const customListName = _.capitalize(req.params.customListName); //lets capitalise the input to make user more easiest to redirect to there list page
  //to check wheather saame list name should not be stored again
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTittle: foundList.name,
          newListitems: foundList.items,
        });
      }
    }
  });
});

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  const checkitemID = req.body.checkbox;
  //lets call the list name from the list.ejs file
  const listName = req.body.listName;
  //lets delete the selected items in there own list
  if (listName === "Today") {
    Item.findByIdAndRemove(checkitemID, function (err) {
      if (!err) {
        console.log("sucessfulyy deleted the item from the list");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkitemID } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen("3000", function () {
  console.log("Server has started on 3000 port");
});
