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

const teamCharterSchema = {
    groupId: [{ type: mongoose.Types.ObjectId, red: 'Group'}],
    groupLeader: String,
    groupResponsibilities: String,
    groupCommunication: String,
    groupMeeting: String,
    groupGoals: String,
}

const User = mongoose.model("User", usersSchema);
const Group = mongoose.model("Group", groupSchema);
const TeamCharter = mongoose.model("TeamCharter", teamCharterSchema)



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
   // console.log(foundUsers);
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
    console.log(firstNameTest.id);
    Group.find({user: firstNameTest.id}, function(err, foundItems) {
        if (err) {
            console.log("No groups found ")
        } else {
            res.render('home', {firstName: firstNameTest, lastName: lastNameTest, groupList: foundItems});
        }
    })
});

// app.post("/home", function (req,res) {
//     res.redirect("/groupInfo", {groupId: customGroupId});
// });



app.get("/groupHome/:customGroupId", async (req, res) => {
    customGroupId = req.params.customGroupId
    group = await Group.findOne({_id: customGroupId})
    User.find({group: customGroupId}, function(err, groupUsers) {
        if (err) {
            console.log("Didn't work, there is error")
        } else {
            res.render('groupHome', {group: group, groupUsers: groupUsers, firstName: firstNameTest, lastName: lastNameTest, groupId: customGroupId});
        }
    });
            // console.log(group);
            // console.log(groupUsers);
            // // for (const x of userArray) {
            // //     console.log(userDetails.firstName + " " + userDetails.lastName);
            // // }
            // groupUsers.user.forEach( async user => {
            //      userDetails =  await User.findOne({_id: user});
            //  });


            // res.render('groupHome', {group: group, groupUsers: groupUsers});
            // // , {groupList: foundItems}
})

app.get("/peerReview/:customGroupId", async (req, res) => {
    customGroupId = req.params.customGroupId
    teamCharter = await TeamCharter.findOne({groupId: customGroupId});
    console.log(teamCharter);
    group = await Group.findOne({_id: customGroupId})
    User.find({group: customGroupId}, function(err, groupUsers) {
        if (err) {
            console.log("Didn't work, there is error")
        } else {
            res.render('peerReview', {group: group, groupUsers: groupUsers, firstName: firstNameTest, lastName: lastNameTest, groupId: customGroupId});
        }
    });
    //res.render('peerReview', {firstName: firstNameTest, lastName: lastNameTest, customGroupId: customGroupId});
})


app.get("/teamCharter/:customGroupId", async (req, res) => {
    customGroupId = req.params.customGroupId
    teamCharter = await TeamCharter.findOne({groupId: customGroupId});
    console.log(teamCharter);
    res.render('teamCharter', {firstName: firstNameTest, lastName: lastNameTest, customGroupId: customGroupId, teamCharter: teamCharter});
})

app.post("/teamCharter/:customGroupId", async (req, res) => {
    customGroupId = req.params.customGroupId;
    console.log(customGroupId);
    groupLeader = req.body.groupLeader;
    groupResponsibilities = req.body.groupResponsibilities;
    groupCommunication = req.body.groupCommunication;
    groupMeeting = req.body.groupMeeting;
    groupGoals = req.body.groupGoals;
  //  Group.updateOne({_id: (groupId)}, { $push: { user: { _id: (userCode) } } }

    TeamCharter.updateOne({groupId: (customGroupId)}, {$set: {groupLeader: groupLeader, groupResponsibilities: groupResponsibilities,
    groupCommunication: groupCommunication, groupMeeting: groupMeeting, groupGoals: groupGoals}}, { upsert: true }, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfylly updated team charter");
    }});

    res.redirect("/groupHome/" + customGroupId);
});



app.get("/createGroup", function(req, res) {
    console.log(firstNameTest.firstName);
    res.render('createGroup', {firstName: firstNameTest, lastName: lastNameTest});
});

app.post("/createGroup", async (req, res) => {
    const newGroupName = req.body.groupName;
    const newGroupSubject = req.body.groupSubject;
    const newGroupUser = firstNameTest.id;
    
    const newGroup = {
        groupName: newGroupName,
        groupSubject: newGroupSubject,
        user: [newGroupUser]
    };
    
    Group.create(newGroup, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully added group into database");
            console.log("group id is" + newGroup.insertedId);
        }
    })
    groupNameTest = await Group.findOne({groupName: newGroupName, groupSubject: newGroupSubject}, "groupName");
    res.redirect('/groupCreated')
    
})

app.get("/groupCreated", function(req, res) {
    var userCode = firstNameTest.id;
    var groupCode = groupNameTest.id;
    console.log(firstNameTest);
    console.log("groupCode from the groupcreated page is " + groupCode);
    User.updateOne({_id: (userCode)}, { $push: { group: { _id: (groupCode) } } }, { upsert: true }, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully assigned group to user");
        }

        // const defualtTeamCharter = {
        //     groupId: groupCode,
        //     groupLeader: "Insert name and student ID of group leader", 
        //     groupResponsibilities: "Insert the different responsibilities of each member. May include scribe, planner, communicator, etc. These may be changed throughout the semester, however it is better to stick with chosen responsibilities.",
        //     groupCommunication: "Can be Microsoft Teams, Messenger, Discord, Zoom Meetings, etc. ", 
        //     groupMeeting: "How often will you meet? What day and what time will you meet? Will it be in person or online? What should someone do if they can't attend a meeting?",
        //     groupGoals: "What are your goals for the semester? Do you plan to achieve a pass or a HD? How will you achieve said goals?"
        // }
        TeamCharter.create({groupId: groupCode, groupLeader: ""});
    });
    //TeamCharter.insert({groupId: groupCode});
    res.render('groupCreated', {groupName: groupNameTest.id, firstName: firstNameTest, lastName: lastNameTest});
    
})


app.get("/joinGroup", async (req, res) => {
    res.render('joinGroup', {firstName: firstNameTest, lastName: lastNameTest});
    var userCode = firstNameTest.id;
    console.log(userCode);
});

app.post("/joinGroup", async (req, res) => {
    const groupId = (req.body.groupId);
    console.log(userCode);
    var userCode = firstNameTest.id;
    if (mongoose.Types.ObjectId.isValid(groupId)) {
    groupExists =  await Group.findOne({_id: (groupId)});
    console.log(groupExists);
        if (groupExists) {
            console.log(userCode + " " + groupId)
            Group.updateOne({_id: (groupId)}, { $push: { user: { _id: (userCode) } } }, {upsert: true}, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("User is pushed to group")
                }
            })
            User.updateOne({_id: (userCode)}, { $push: { group: { _id: (groupId) } } }, { upsert: true }, function(err) {
                if (err) {
                    console.log("Did not push group to user")
                } else {
                    console.log("did push group for new user")
                }
            })
            res.send("Group exists and is added to user");
        } else {
            res.send("Groups does not exist");
        }
    } else {
        res.send("Code is not valid")
    }
})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});