const express = require('express');
const exphbs = require('express-handlebars');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');

// Middleware access
const hasAccess = require("../middleware/auth");
const hasAccessAdmin = require("../middleware/admin");

// Data model
const User = require('../models/User');
const Book = require('../models/Book');
const Room = require("../models/Room");

// Route to direct use to Registration form
router.get("/registration", (req, res) => 
{
    res.render("User/registration");
});

// Route to process user's request and data when user submits registration form
router.post("/registration", (req, res)=>
{
    const errors = [];
    //const reqExp = new RegExp("^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,12}$");
    const reqExp = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/;

    const newUser = {
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        pwd : req.body.pwd,
        dob : req.body.dob
    }

    if (req.body.email == "") {
        errors.push("Please enter your email");
    }
    if (req.body.firstName == "") {
        errors.push("Please enter your first name");
    }
    if (req.body.lastName == "") {
        errors.push("Please enter your last name");
    }
    if (req.body.pwd == "") {
        errors.push("Please enter your password");
    }
    if (req.body.pwd != "") {
        if (req.body.pwd.length < 6) errors.push("Password must have at least 6 characters");
        else if (!reqExp.test(req.body.pwd)) errors.push("Password must contain at least 1 character and 1 digit!");
    }
    if (req.body.dob == "") {
        errors.push("Please enter your birthday");
    }
    
    if (errors.length > 0) {
        res.render("User/registration",{
            errors:errors
        }); 
    }

    User.findOne({email:newUser.email})
    .then(user=>{
        if (user != null)
        {
            errors.push(`User is existed`);
            res.render("User/registration",{
                errors:errors
            });
        }
        else
        {
            const user = new User(newUser);
            user.save()
            .then(()=>{
                console.log(`User was added to the database`);
                console.log(`${user}`);
                res.redirect("/user/login");
            })
            .catch(err=>console.log(`Error : ${err}`));
        }
    })
    .catch(err=>console.log(`Something occured ${err}`));
});

router.get("/login", (req, res) => {
    res.render("User/login");
});

router.post("/login", (req, res) => {

    const errors = [];
    const formData = {
        email : req.body.email,
        pwd : req.body.pwd
    }

    User.findOne({email:formData.email})
    .then(user=>{
        if (user == null)
        {
            errors.push("Sorry your email was not found");
            res.render("User/login", {
                errors:errors
            })
        }
        else
        {
            bcryptjs.compare(formData.pwd, user.pwd)
            .then(isMatched=>{
                if (isMatched == true)
                {
                    req.session.userInfo = user;
                    //res.redirect("/user/profile")
                    if (formData.email == "thanhtrung1012000@gmail.com")
                    {
                        bcryptjs.compare(formData.pwd, user.pwd)
                        .then(isMatched=>{
                            if (isMatched == true) res.redirect("/user/admin");
                        })  
                    }
                    else
                    {
                        res.redirect("/user/user");
                    }
                }
                else
                {
                    errors.push("Sorry, your password does not match");
                    res.render("User/login", {
                        errors:errors
                    })
                }
            })
            .catch(err=>console.log(`Error : ${err}`));
        }
    })
    .catch(err=>console.log(`Something occured ${err}`));
});

router.get("/logout", (req, res)=>{
    // This destroys the session
    req.session.destroy();
    res.redirect("/");
});

router.get("/user", hasAccess,(req, res)=>
{
    Book.find({userid:req.session.userInfo._id})
    .then(books=>res.render("User/userDashBoard",{books}));
});

// Administrator Module
router.get("/admin", hasAccessAdmin, (req,res)=>{
    const query = {};
    if (req.query.locations)
    {
        query.locations = req.query.locations;
    }
    Room.find(query)
    .then(room=>{
        console.log(room);
        res.render("User/adminDashBoard",{
            room : room
        });
    })
    .catch(err=>console.log(`Error : ${err}`));
    //res.render("User/adminDashBoard");
});

// Route to direct use to Add Room form
router.get("/add", hasAccessAdmin, (req, res)=>
{
    res.render("Room/addRoom");
});

// Route to process user's request and data when the user submits the add task form
router.post("/add", hasAccessAdmin, (req, res)=>
{
    const newRoom = 
    {
        roomTitle : req.body.roomTitle,
        price : req.body.price,
        description : req.body.description,
        location : req.body.location
    }

    const errors = [];

    if (req.body.roomTitle == "")
    {
        errors.push("Please enter your room title");
    }
    if (req.body.price == "")
    {
        errors.push("Please enter your room price");
    }
    if (req.body.description == "")
    {
        errors.push("Please enter your room description");
    }
    if (req.body.location == "")
    {
        errors.push("Please enter your room location");
    }
    // Test to see if user did not upload file
    if (req.files == null)
    {
        errors.push("Sorry you must upload a file");
    }
    // User uploaded file
    else
    {
        // file is not an image
        //if (req.files.roomImg.mimetype.indexOf("image") == -1)
        if (req.files.roomImg.mimetype.indexOf("image") == -1)
        {
            errors.push("Sorry you can only upload images : Example (jpg, gif, png,...)");
        }
    }

    // Has errors
    if (errors.length > 0)
    {
        res.render("Room/addRoomForm", {
            errors:errors,
            roomTitle : newRoom.roomTitle,
            price : newRoom.price,
            description : newRoom.description,
            location : newRoom.location
        });
    }
    else
    {
        Room.findOne({roomTitle:newRoom.roomTitle})
        .then(room=>{
            if (room == null)
            {
                const room = new Room(newRoom);
                room.save()
                .then(room => {
                    req.files.roomImg.name = `db_${room._id}${path.parse(req.files.roomImg.name).ext}`;

                    req.files.roomImg.mv(`public/uploads/${req.files.roomImg.name}`)
                    .then(()=>{
                        Room.findByIdAndUpdate(room._id, {
                            roomImg : req.files.roomImg.name
                        })
                        .then(()=>{
                            console.log(`File name was updated in the database`)
                        })
                        .catch(err=>console.log(`Error : ${err}`));
                    });
                })
                .catch(err=>console.log(`Cannot add room : ${err}`));
                res.redirect("/user/admin");
            }
            else
            {
                errors.push("There is a room with the same title");
                res.render("User/adminDashBoard", {
                    errors : errors
                });
            }
        })
        .catch(err=>console.log(`Cannnot add room : ${err}`))
    }
});


router.delete("/delete/:id", hasAccessAdmin, (req, res)=>{
    Room.findById(req.params.id)
    .then(room=>{
        fs.unlinkSync(`public/uploads/${room.roomImg}`);
    })
    .catch(err=>console.log(`Error : ${err}`));

    Room.deleteOne({_id:req.params.id})
    .then(room=>{
        res.redirect("/room");
    })
    .catch(err=>console.log(`Error : ${err}`));
});

router.get('/edit/:id', hasAccessAdmin, (req, res)=>{
    Room.findById(req.params.id)
    .then(room=>{
        res.render("Room/roomEditForm",{
            room:room
        });
    })
    .catch(err=>{
        console.log(`Error : ${err}`)
        res.redirect("/room");
    });
});

router.put("/edit/:id", hasAccessAdmin, (req, res)=>{
    const errors = [];

    Room.findById(req.params.id)
    .then(room=>{
        Room.findOne({roomTitle:req.body.roomTitle})
        .then(matchRoom=>{
            if (matchRoom == null || matchRoom.roomTitle == room.roomTitle)
            {
                room.roomTitle = req.body.roomTitle;
                room.price = req.body.price;
                room.description = req.body.description;
                room.location = req.body.location;

                room.save()
                .then(()=>{
                    if (req.files != null)
                    {
                        req.files.roomImg.name = room.roomImg;
                        fs.unlinkSync(`public/uploads/${room.roomImg}`);

                        req.files.roomImg.mv(`public/uploads/${req.files.roomImg.name}`)
                        .then(()=>{
                            console.log("Update the picture");
                        });
                    }
                    res.redirect("/user/admin");
                })
                .catch(err=>console.log(`Error : ${err}`));
            }
            else
            {
                errors.push("There is one room with the same title");
                res.render("Room/roomEditForm", {
                    room : room,
                    errors : errors
                });
            }
        })
    })
    .catch(err=>console.log(`Error : ${err}`));
});


// Booking module
router.get("/booking/:id", hasAccess, (req,res)=>{
    Room.findById(req.params.id)
    .then(room=>{
        const booking = {
            roomid : room._id,
            userid : req.session.userInfo._id,
            roomTitle : room.roomTitle,
            price : room.price,
            description : room.description,
            location : room.location,
            roomImg : room.roomImg
        }
        const booked = new Book(booking)
        booked.save()
        .then(()=>res.redirect("/user/user"))
        console.log(`success!`)
    })
    .catch(err=>{
        res.redirect("/room");
        console.log(`Error : ${err}`);
    });
})

module.exports = router;