//jshint esversion:6

const dotenv = require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Using sesion
app.use(session({
  secret: 'My little Secret',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true } // This code does't redirect me to secrets page so commented it
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// To save user data to mongoDB
userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["password"]}); // Should be before mongoose model

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", function(req, res) {
  const user = new User ({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  })

});

app.get("/register", function(req, res){
  res.render("register");

});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout(function(err){
    if (err){
      console.log(err);
    } else {
      res.redirect("/");
    }
  });

});

app.post("/register", function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
    console.log(err);
    res.redirect("/register");
  } else {
    // To check if logedIn or not
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secrets");
    });
  }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
