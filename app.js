const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/groupToolDB", {useNewUrlParser:true});

var firstNameTest = "";
var lastNameTest = "";
var userID = "";
var groupNameTest = "";

const usersSchema = {
    firstName: String,
    lastName: String,
    email: String, 
    password: String,
    group: [{ type: mongoose.Types.ObjectId, ref: 'Group'}]
};

const groupSchema = {
    groupName: String,
    groupSubject: String,
    user: [{ type: mongoose.Types.ObjectId, ref: 'User'}]
}

const User = mongoose.model("User", usersSchema);
const Group = mongoose.model("Group", groupSchema);

// const user1 = {
//     firstName: "Christian",
//     lastName: "Lopez",
//     email: "lopezchristian1711@gmail.com",
//     password: "ChristianLopez123"
// };

// User.create(user1, function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully added into database");
//     }
// })

app.get("/", function(req, res) {
    User.find({}, function(err, foundUsers){
    res.render("login", {errorMsg: ""});
    //res.render('login');
    console.log(foundUsers);
    });
});

app.post("/", async(req, res) => {
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;
  
    const userExists = await User.findOne({email: loginEmail});
    const passwordExists = await User.findOne({password: loginPassword});
    const firstName = await User.findOne({email: loginEmail}, 'firstName');
    const lastName = await User.findOne({email: loginEmail}, 'lastName');

    //  && User.findOne({ password: loginPassword})
    if (userExists && passwordExists){
        res.redirect('home');
      //  console.log(loginEmail + " " + loginPassword + "Exists!!!!!");
        firstNameTest = firstName;
        lastNameTest = lastName;
    }   
    else
    {
    res.render("login", {errorMsg: "Invalid email or password"});
    console.log(loginEmail + loginPassword + "did not work");
    }
})

app.get("/register", function(req, res) {
    res.render('register');
});

app.post("/register", async(req, res) => {
    const newFirstname = req.body.firstName;
    const newLastname = req.body.lastName;
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const newPassword2 = req.body.password2

    const emailTaken = await User.findOne({email: newEmail});

        if (newPassword === newPassword2) {
        if (emailTaken) {
            console.log("email is taken");
            res.render('register', {errorMsg: "Email is incorrect"});
        } else {
            const newUser = {
                firstName: newFirstname,
                lastName: newLastname,
                email: newEmail,
                password: newPassword
            };
            User.create(newUser, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added into database");
                }
            })
        }
        res.redirect("/")
    } else {
        res.render('Register');
        console.log("Password does not match");
    }

})

app.get("/home", function(req, res) {
    console.log(firstNameTest);
    res.render('home', {firstName: firstNameTest, lastName: lastNameTest});
});

app.get("/createGroup", function(req, res) {
    console.log(firstNameTest.firstName);
    res.render('createGroup');
});

app.post("/createGroup", async (req, res) => {
    const newGroupName = req.body.groupName;
    const newGroupSubject = req.body.groupSubject;
    const newGroupUser = firstNameTest.id;
    
    const newGroup = {
        groupName: newGroupName,
        groupSubject: newGroupSubject,
        user: newGroupUser
    };

    Group.create(newGroup, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully added group into database");
        }
    })
    groupNameTest = await Group.findOne({groupName: newGroupName}, "groupName");
    //console.log(groupNameTest.id);
    res.redirect('/groupCreated');
})

app.get("/groupCreated", function(req, res) {
    var userCode = firstNameTest.id;
    User.updateOne({_id : (userCode)}, { $set: {group: groupNameTest.id}}, {upsert: true}, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully assigned group to user");
        }
    });
    res.render('groupCreated', {groupName: groupNameTest.id});
    
})

app.get("/joinGroup", async (req, res) => {
    res.render('joinGroup');
    // const groupId = req.body.groupId;

    // groupExists =  await Group.findOne({_id: groupId});
    // if (groupExists) {
    //     res.send("This probably works")
    // } else{
    //     res.send("Didnt work try again")
    // }

});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});