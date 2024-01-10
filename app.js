const express = require("express");
// const prompt = require('prompt-sync')();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
var items = [];
var workItems = [];
main().catch(err => console.log(err));
let today = new Date();
let options = {
    weekday : "long",
    day : "numeric",
    month : "long",        
}
var day = today.toLocaleDateString("en-US",options);
async function main(){
    await mongoose.connect('mongodb+srv://myallcode1234:ToDoList@cluster0.5gz0jp9.mongodb.net/?retryWrites=true&w=majority/todolistDB');
}
var todolistSchema = new mongoose.Schema({
    Name: String
});
var listSchema = new mongoose.Schema({
    Name : String,
    Items : [todolistSchema]
});
const Item = mongoose.model('Item',todolistSchema);
const List = mongoose.model('List',listSchema);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const item1 = new Item(
    {
        Name: "welcome to Todolist."
    }
)
const item2 = new Item(
    {
        Name: "Hit the + button to add item."
    }
)
const item3 = new Item({
    Name: "<-- tap on the box icon to delete the item."
})
const defaultItems = [item1,item2,item3];
app.get("/",function(req,res){
    Item.find()
.then((item)=>{
    if(item.length === 0){
        Item.insertMany(defaultItems)
        .then(()=>{console.log("items are inserted.");})
        .catch((err)=>{console.log(err);})
        res.redirect('/');
    }
    else {
    res.render("list",{listTitle: day ,newListitem: item});
    }
})
.catch((err)=>{console.log(err);})
});
// app.get("/work",function(req,res){
//     res.render("list",{listTitle: "Work",newListitem: workItems});
// });
// var c = 0;
app.get("/:customList",function(req,res){
    const customList = _.capitalize(req.params.customList);
    List.findOne({Name: customList})
    .then((docs)=> {
      if(!docs) {
         const list = new List ({
        Name: customList,
        Items: defaultItems
    });
        // console.log("doesn't exists");
        list.save();
        res.redirect("/"+customList);
      }
      else {
        // console.log("already exists");
        res.render("list",{listTitle: customList , newListitem: docs.Items});
      }
    })
    .catch((err)=> {
        console.log(err);
    })
   
   
});
// app.get("/about",function(req,res){
//     res.render("about");
// });
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({
        Name : itemName
    })
    if(listName === day){
        item.save();
        res.redirect("/");
    }
    else {
       List.findOne({Name : listName})
       .then((fndlist)=> {
        fndlist.Items.push(item);
        fndlist.save();
        res.redirect('/'+listName);
       })
       .catch((err)=> {
        console.log(err);
       })
    }

})
app.post("/delete",function(req,res){
    const delItem = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === day){
        Item.findByIdAndDelete(delItem)
    .then(()=>{console.log("deleted your checked item");})
    .catch((err)=>{console.log(err);})
    res.redirect('/');
    }
    else {
        List.findOneAndUpdate({Name: listName},{$pull: {Items: {_id: delItem}}})
        .then(()=>{
            res.redirect('/'+listName);
        })
    }
})
app.listen(3000,function(){
    console.log("server is running on port 3000");
})