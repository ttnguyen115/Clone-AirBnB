const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const path = require('path');
const hasAccess = require("../middleware/auth");
const hasAccessAdmin = require('../middleware/admin');
const mongoose = require('mongoose');
const Room = require('../models/Room');

//const sgMail = require('@sendgrid/mail');

// This allows you to perform CRUD operations on the User collections
const User = require("../models/User");

// The "/" shows the home template
router.get("/", (req,res)=>{
    res.render("General/home");
});

// Function to display listing room
router.get("/room-listing", (req,res)=>{
    Room.find()
    .then(room=>{
        res.render("Room/room-listing", {
            room : room
        })
    })
    .catch(err=>console.log(`Error : ${err}`));
});

router.get("/user/room-listing", hasAccess, (req,res)=>{
    Room.find()
    .then(room=>{
        res.render("Room/myRoom",{
            room : room
        })
    })
    .catch(err=>console.log(`Error : ${err}`));
});


// // Route to direct use to Registration form
// router.get("/registration", (req, res) => 
// {
//     res.render("User/registration");
// });

// // Route to process user's request and data when user submits registration form
// router.post("/registration", (req, res)=>
// {
//     const errors = [];
//     //const reqExp = new RegExp("^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,12}$");
//     const reqExp = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;

//     const newUser = {
//         email : req.body.email,
//         firstName : req.body.firstName,
//         lastName : req.body.lastName,
//         pwd : req.body.pwd,
//         dob : req.body.dob
//     }

//     if (req.body.email == "") {
//         errors.push("Please enter your email");
//     }
//     if (req.body.firstName == "") {
//         errors.push("Please enter your first name");
//     }
//     if (req.body.lastName == "") {
//         errors.push("Please enter your last name");
//     }
//     if (req.body.pwd == "") {
//         errors.push("Please enter your password");
//     }
//     if (req.body.pwd != "") {
//         if (req.body.pwd.length < 6) errors.push("Password must have at least 6 characters");
//         else if (!reqExp.test(req.body.pwd)) errors.push("Password must contain at least 1 character and 1 digit!");
//     }
//     if (req.body.dob == "") {
//         errors.push("Please enter your birthday");
//     }
    
//     if (errors.length > 0) {
//         res.render("User/registration",{
//             errors:errors
//         }); 
//     }

//     User.findOne({email:newUser.email})
//     .then(user=>{
//         if (user != null)
//         {
//             errors.push(`User is existed`);
//             res.render("User/registration",{
//                 errors:errors
//             });
//         }
//         else
//         {
//             const user = new User(newUser);
//             user.save()
//             .then(()=>{
//                 console.log(`User was added to the database`);
//                 console.log(`${user}`);
//                 res.redirect("/login");
//             })
//             .catch(err=>console.log(`Error : ${err}`));
//         }
//     })
//     .catch(err=>console.log(`Something occured ${err}`));
// });

// router.get("/login", (req, res) => {
//     res.render("User/login");
// });

// router.post("/login", (req, res) => {

//     const errors = [];
//     const formData = {
//         email : req.body.email,
//         pwd : req.body.pwd
//     }

//     User.findOne({email:formData.email})
//     .then(user=>{
//         if (user == null)
//         {
//             errors.push("Sorry your email was not found");
//             res.render("User/login", {
//                 errors:errors
//             })
//         }
//         else
//         {
//             bcryptjs.compare(formData.pwd, user.pwd)
//             .then(isMatched=>{
//                 if (isMatched == true)
//                 {
//                     req.session.userInfo = user;
//                     //res.redirect("/user/profile")
//                     if (user.is_admin == false)
//                     {
//                         console.log("user");
//                         res.redirect("/user/profile");
//                     }
//                     else
//                     {
//                         req.session.adminInfo = user;
//                         console.log("admin");
//                         res.redirect("/admin/profile");
//                     }
//                 }
//                 else
//                 {
//                     errors.push("Sorry, your password does not match");
//                     res.render("User/login", {
//                         errors:errors
//                     })
//                 }
//             })
//             .catch(err=>console.log(`Error : ${err}`));
//         }
//     })
//     .catch(err=>console.log(`Something occured ${err}`));
// });

// router.get("/logout", (req, res)=>{
//     // This destroys the session
//     req.session.destroy();
//     res.redirect("/");
// });

// router.get("/user/profile", (req, res)=>
// {
//     res.render("User/userDashboard");
// })

// // Administrator Module
// router.get("/admin/profile", hasAccessAdmin, (req,res)=>{
//     res.render("User/adminDashBoard");
// });

// Search module
router.get("/results", (req,res)=>{
    res.render("Room/room-list");
});

router.post("/results", (req, res)=>{
    console.log(req.body.location)
    Room.find({location:req.body.location})
    .then(room=>{
        if (room == null)
        {
            res.render("Room/myRoom")
        }
        else
        {
            res.render("Room/myRoom", {
                room : room
            })
        }
    })
    .catch(err=>console.log(`Error : ${err}`));
});

// router.get("/user", hasAccess, (req,res)=>{
//     book.find({email:req.session.user.email})
//     .then(book => res.render("User/userdashboard",{book:book}))
// })

module.exports = router;

