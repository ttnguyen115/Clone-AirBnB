const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const fileupload = require("express-fileupload");

// This loads all our environment variables from the keys.env
require("dotenv").config({path:'./config/keys.env'});

// Import your router objects
const generalRoutes = require('./router/General');
const userRoutes = require('./router/User');
//const roomRoutes = require('./router/Room');

//Create Express APp Ojbect
const app = express();

//This is how you map your file upload to express
app.use(fileupload());

//This load all the static assets in the public folder, such include css file, images, js file(s)
app.use(express.static("public"));

//This tells Express that I want to use handlebars as my TEMPLATING ENGINE!!!!!!!!!!
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// This tells Express to parse all submitted form data into the body of the request object
app.use(bodyParser.urlencoded({ extended: false }));

// Override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

app.use(session({secret:"This is my secret key. This should not be shown to everyone"}));

app.use((req, res, next)=>{
    res.locals.user = req.session.userInfo;
    next();
})

// Maps EXPRESS TO ALL OUR ROUTER OBJECTS
app.use("/", generalRoutes);
app.use("/user", userRoutes);
// app.use("/room", roomRoutes);
// app.use("/", userRoutes);
// app.use("/admin", roomRoutes)

//This code is used to connect mongoose to our MONGODB in the Cloud
const DBURL = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0-5bzhh.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    //The then block will only be executed if the above-mentioned line is successful
    .then(() => {
        console.log(`Database is connected`)
    })
    //The catch block will only be executed if the connection failed
    .catch(err => {
        console.log(`Something went wrong : ${err}`);
    })


PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Connected Successfully to PORT: ${PORT}`);
});