const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.document = new JSDOM().window.document;

const app = express();

 
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-clopez:Test-123@groupifycluster.pels3cu.mongodb.net/groupToolDB", {useNewUrlParser:true});

var firstNameTest = "";
var lastNameTest = "";
var userID = "";
var groupNameTest = "";

//------------------------------ Schemas for Mongo DB ------------------------------------------

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

const peerEvaluationSchema = {
    markerId: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    receiverId: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
    groupId: [{ type: mongoose.Types.ObjectId, red: 'Group'}], 
    evaluation1: Number, 
    evaluation2: Number, 
    evaluation3: Number, 
    evaluation4: Number,
    comments: String, 
}

//------------------------------ Initialising Schemas for JS use ------------------------------------------

const User = mongoose.model("User", usersSchema);
const Group = mongoose.model("Group", groupSchema);
const TeamCharter = mongoose.model("TeamCharter", teamCharterSchema)
const PeerEvaluation = mongoose.model("PeerEvaluation", peerEvaluationSchema)

//------------------------------------ Initial Page: Login -------------------------------------------------

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

//------------------------------------ Register Pages GET/POST -------------------------------------------------

app.get("/register", function(req, res) {
    res.render('register', {errorMsg: ""});
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
            res.render('register', {errorMsg: "Account already created with email"});
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
        res.render("registerSuccess");
    } else {
        res.render('Register', {errorMsg: "Passwords do not match"});
    }

});

//------------------------------------ Successful Registration page -------------------------------------------------

app.get("/registerSuccess", function (req,res) {
    res.render('registerSuccess');
})

//------------------------------------ Home Page -------------------------------------------------

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

//------------------------------------ Group Home Page with group ID -------------------------------------------------

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

//------------------------------------ Create group page -------------------------------------------------

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
            console.log("group id is" + newGroup._id);
        }
    })
    groupNameTest = await Group.findOne({groupName: newGroupName, groupSubject: newGroupSubject}, "groupName");
    res.redirect('/groupCreated')
    
})

//------------------------------------ Successfully created group page -------------------------------------------------

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
        TeamCharter.create({groupId: groupCode, groupLeader: ""});
    });
    //TeamCharter.insert({groupId: groupCode});
    res.render('groupCreated', {groupName: groupNameTest.id, firstName: firstNameTest, lastName: lastNameTest});
    
})

//------------------------------------ Join Group Page -------------------------------------------------

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
            res.render('joinGroupSuccess', ({groupName: groupExists, firstName: firstNameTest, lastName: lastNameTest}))
        } else {
            res.render('joinGroupFailure', ({firstName: firstNameTest, lastName: lastNameTest}));
        }
    } else {
        res.render('joinGroupFailure', ({firstName: firstNameTest, lastName: lastNameTest}));
    }
})

//------------------------------------ Group Peer Review Page: Blank page -------------------------------------------------

app.get("/peerReview/:customGroupId", async (req, res) => {
    customGroupId = req.params.customGroupId
    group = await Group.findOne({_id: customGroupId})
    User.find({group: customGroupId}, function(err, groupUsers) {
        if (err) {
            console.log("Didn't work, there is error")
        } else {
            res.render('peerReview', {group: group, groupUsers: groupUsers, firstName: firstNameTest, lastName: lastNameTest, groupId: customGroupId});
        }
    });
 
    //res.render('peerReview', {firstName: firstNameTest, lastName: lastNameTest, customGroupId: customGroupId});
});

//------------------------------------ Group Peer Review Page: Specificed Page -------------------------------------------------

app.get("/peerReview/:customGroupId/:userId", async (req,res) => {
    customGroupId = req.params.customGroupId;
    userId = req.params.userId;
    receiverUserId = req.body.receiverId;
    markerUserId = firstNameTest.id;
    console.log("Receiver Id: " + userId)
    group = await Group.findOne({_id: customGroupId});
    user = await User.findOne({_id: userId});
    peerReviewExists = await PeerEvaluation.findOne({groupId: customGroupId,  markerId: markerUserId, receiverId: userId})
    if (peerReviewExists) {
        User.find({group: customGroupId}, function(err, groupUsers) {
            if (err) {
                console.log("Didn't work, there is error")
            } else {
                res.render('peerReviewUser', {group: group, groupUsers: groupUsers, firstName: firstNameTest, lastName: lastNameTest, groupId: customGroupId, userId: user, peerReview: peerReviewExists});
            }
        });
    } else {
        await PeerEvaluation.create({groupId: customGroupId, markerId: markerUserId, receiverId: userId, evaluation1: 1, evaluation2: 1, evaluation3: 1, evaluation4: 1, comments: ""});
        User.find({group: customGroupId}, function(err, groupUsers) {
            if (err) {
                console.log("Didn't work, there is error")
            } else {
                res.render('peerReviewGuide', {group: group, groupUsers: groupUsers, firstName: firstNameTest, lastName: lastNameTest, groupId: customGroupId, userId: user});
                }
        });
    }
    
})

app.post("/peerReview/:customGroupId/:userId", async (req,res) => {
    customGroupId = req.params.customGroupId;
    markerUserId = firstNameTest.id;
    receiverUserId = req.body.receiverId;
    evaluation1 = req.body.evaluation1;
    evaluation2 = req.body.evaluation2;
    evaluation3 = req.body.evaluation3;
    evaluation4 = req.body.evaluation4
    comments =req.body.comments;

    const newPeerReview = {
    markerId: [markerUserId],
    receiverId: [receiverUserId],
    groupId: [customGroupId], 
    evaluation1: evaluation1, 
    evaluation2: evaluation2, 
    evaluation3: evaluation3, 
    evaluation4: evaluation4,
    comments: comments, 
    }

    //peerEvaluation = await PeerEvaluation.findOne({groupId: customGroupId, markerId: markerUserId, receiverId: receiverUserId});
    console.log("Group Id: " + customGroupId);
    console.log("Marker Id: " + markerUserId);
    console.log("Receiver Id: " + receiverUserId);


    peerReviewExists = await PeerEvaluation.findOne({groupId: customGroupId, markerId: markerUserId, receiverId: receiverUserId}, "_id")
    console.log(peerReviewExists);
    peerReviewId = peerReviewExists._id;
    console.log(peerReviewId)

    
    if (peerReviewExists) {
        PeerEvaluation.updateOne({_id: (peerReviewExists)}, {$set: {evaluation1: evaluation1, evaluation2: evaluation2, evaluation3: evaluation3, evaluation4: evaluation4, comments: comments}}, {upsert: true}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfylly updated peer review");
        }}); 
    }
    else {
        PeerEvaluation.create(newPeerReview, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully added peer evaluation into database");
            }
        });
    }
    res.redirect('/peerReview/' + customGroupId + '/' + userId);
    
})

//------------------------------------ Group Peer Review Guidance Page -------------------------------------------------


app.get("/peerReviewGuide", function(req,res) {
    res.render('peerReviewGuide');
}) 

app.post("/peerReviewGuide", function(req, res) {
    customGroupId = req.params.customGroupId;
    receiverUserId = req.body.receiverId;
    res.redirect('/peerReviewGuide' + customGroupId + '/' + receiverUserId);
})

//------------------------------------ Group Team Charter Page -------------------------------------------------


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


app.listen(3000, function(){
    console.log("Server started on port 3000");
});