const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.get("/", (req, res)=>{
    res.render("General/home");
});

router.get("/room", (req, res)=>{
    const query = {};
    if (req.query.locations)
    {
        query.location = req.query.locations;
    }
    Room.find(query)
    .then(room=>{
        console.log(room);
        res.render("Room/room",{
            room : room
        });
    })
    .catch(err=>console.log(`Error : ${err}`));
});

module.exports = router;