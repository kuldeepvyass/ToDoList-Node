//jshint esversion6
const express=require("express");
const app=express();
app.set("view engine","ejs"); 
const bodyParser = require("body-parser");
app.use(express.static("public"));
const { engine } = require("express/lib/application");
const _=require("lodash");
app.use(bodyParser.urlencoded({extended: true})); 
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin-kuldeep:system@cluster0.bmtbm.mongodb.net/toDoDB');

const toDoSchema=new mongoose.Schema({
  data:String
});
const ToDo = mongoose.model("ToDo",toDoSchema);
const ListSchema=new mongoose.Schema({
  name:String,
  items:[toDoSchema]
});
const todo1=new ToDo({
    data:"Welcome to your TO Do List"
});
const todo2=new ToDo({
    data:"Press + to add new item"
});
const todo3=new ToDo({
    data:"<-- Press this to delete item"
});
const defaults=[todo1,todo2,todo3]

const List = mongoose.model("List",ListSchema);


app.get("/",function(req,res){
   ToDo.find(function(err,list){
     if(err)
     console.log(err);
     else {
        if(list.length===0)
        {
           ToDo.insertMany(defaults,function(err){
              if(err)
              console.log(err);
              else 
              console.log("default data inserted");
           });
           res.redirect("/");
        }
        else
        res.render('list',{listTitle:"Today",todolist:list}); 
        }
     
});
  

    
});

app.get("/:typelist",function(req,res){
  const listname =_.capitalize(req.params.typelist);
  List.findOne({name:listname},function(err,foundlist){
     if(!err)
     {
        if(!foundlist){
           var list1=new List({
              name:listname,
              items:defaults
           });
           list1.save();
           res.redirect("/"+listname);
        }
        else {
           res.render("list",{listTitle:foundlist.name,todolist:foundlist.items})
        }
     }
  })
 
});
// app.post("/:typelist",function(req,res){
//    const listname =req.params.typelist;
//    const newlist=new List({
//        name:listname,
//       data:req.body.item
//  });
//  newlist.save();
// res.redirect("/"+listname);
// });
app.post("/",function(req,res){
  var listname=req.body.submit;   
  const value=new ToDo({
          data:req.body.item
     });
     if(listname==="Today")
     {
        value.save();
        res.redirect("/");   
     }
     else{
          List.findOne({name:listname},function(err,foundlist){
             foundlist.items.push(value);
             foundlist.save();
             res.redirect("/"+listname);
          });
     }
     
});

app.post("/delete",function(req,res){
  var listname=req.body.lname;
  if(listname==="Today")
  {   
  ToDo.deleteOne({_id:req.body.checkbox},function(err){
     if(err)
     console.log(err);
     else
     console.log("delete success");
     res.redirect("/");
 });
 }
 else {
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:req.body.checkbox}}},function(err,foundlist){
        if(err)
        console.log(err);
        else
          res.redirect("/"+listname);
    });
 }
});
const port = process.env.PORT || 3000
app.listen(port,function(){
    console.log("connected");
});

