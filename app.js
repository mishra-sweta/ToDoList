const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

mongoose.set('strictQuery', false);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sweta_mishra:Bike2013@atlascluster.gqssns9.mongodb.net/todolistDB");

const itemsSchema ={
  name:String
}

const Item = mongoose.model("Item", itemsSchema);

const task1 =new Item({
  name:"Take a Bath"
});

const task2 =new Item({
  name:"Cook Breakfast"
});

const task3 =new Item({
  name:"Go to work"
});

const defaultItems =[task1, task2, task3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find({},function (err,results) {

    if(results.length === 0){

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }else {
          console.log("Items added successfully");
        }
      })
      res.redirect("/");
    }else {
      res.render("list", {
        listTitle: "Today",
        newListItems:results
      })
    }
  });
});

app.get("/:titleName", function (req,res) {
  const titl = _.capitalize(req.params.titleName);

  List.findOne({name:titl}, function (err,foundList) {
    if(!err){
      if (!foundList) {
        // Add the list
        const list = new List({
          name: titl,
          items: defaultItems
        })
        list.save();
        res.redirect("/")
      }else {
        // Show the list
        res.render("list", {
          listTitle:foundList.name,
          newListItems:foundList.items
        })
      }
    }
  })
})

app.post("/", function (req,res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const taskn =new Item({
    name:itemName
  });
  if (listName === "Today") {
    taskn.save();
    res.redirect("/")
  }else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(taskn);
      foundList.save();
      res.redirect("/"+listName)
    });
  }
});

app.post("/delete", function (req,res) {

  const deleteItem =req.body.checkbox;
  const listName =req.body.listName;

  if(listName =="Today"){
    Item.deleteOne({_id:deleteItem} , function (err) {
      if (err) {
        console.log(err);
      }else {
        console.log("deleted checked item");
      }
      res.redirect("/")
    })
  }else {
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:deleteItem}}}, function (err,foundList) {
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


})

app.get("/about", function(req, res){
  res.render("about");
})


app.listen(process.env.POST || 3000, function() {
  console.log("Server started on port 3000");
});
