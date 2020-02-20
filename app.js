var express = require("express");
var cookieParser = require('cookie-parser');
var body_parser = require('body-parser');
var session = require('express-session');
var fileops = require("./fileops");
var fs = require("fs");
var app = express();

app.use(express.json());
app.use(body_parser.urlencoded({extended: false}))
app.set('view engine', 'pug');
app.set('views', './views');
app.use(cookieParser());
app.use(session({secret: "secret"}));

app.get("/", (req, res) => {
    if(req.session.user) return res.redirect("/home");
    return res.redirect("/login");
});

app.get("/register_user", (req, res) => {
    res.render("register_user");
});

app.post("/register_user", (req, res) => {
    if(req.session.user) return res.redirect("/home");
    req.body.coursesRegistered = {};
    req.body.coursesAuthored = [];
    req.body.type = "student";
    promise = fileops.createNewUser(req.body);
    promise
        .then(() => {
            return res.redirect("/login");
        })
        .catch(() => {
            res.render("register_user", {
                message: "Username already taken. Try again."
            });
        });
});

app.get("/login", (req, res) => {
    if(req.session.user) return res.redirect("/home");
    res.render("login");
});

app.post("/login", (req, res) => {
    var userData = fileops.getParsedData("data/users.json");
    userData
        .then((Data) => {
            let signedIn = false;
            for(i of Data) {
                if(i.username == req.body.username && i.password == req.body.password) {
                    req.session.user = i;
                    signedIn = true;
                    break;
                }
            }
            if(!signedIn) 
                res.render("login", {
                    message: "Invalid credentials. Try again."
                });
            else
                return res.redirect("/home");
        });
});

app.get("/home", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    var regCourses = [];
    var authCourses = [];
    var courseData = fileops.getCourses(req.session.user);
    courseData
        .then((data) => {
            regCourses = data[0];
            authCourses = data[1];
            res.render("home", {
                user: req.session.user,
                courses: regCourses,
                auth: authCourses
            });
        });
});

app.post("/home", (req, res) => {
    req.session.destroy();
    return res.redirect("/login");
});

app.get("/profile", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    res.render("profile", {
        user: req.session.user
    });
});

app.get("/course/:id/:type", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    var course = fileops.courseDetails(req.params.id);
    var type = fileops.courseDetails(req.params.type);
    course
        .then((data) => {
            res.render("course", {
                id: req.params.id,
                course: data,
                user: req.session.user,
                type: type
            });
        });
});

app.get("/new_course", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    res.render("new_course");
});

app.post("/new_course", (req, res) => {
    id = req.body.id;
    //First update the course database
    var courseData = fileops.getParsedData("data/courses.json");
    courseData
        .then((data) => {
            if(data[id]) {
                data[id].offeredBy.push(req.session.user.name);
            }
            else {
                data[id] = {
                    name: req.body.name,
                    start: req.body.start,
                    end: req.body.end,
                    desc: req.body.desc,
                    offeredBy: [req.session.user.name]
                };
            }
            fs.writeFile("data/courses.json", JSON.stringify(data), (err) => {
                if(err) console.log(err);
            });
        }); 
    //Also update the user coursesAuthored and session variable. Happens in parallel
    req.session.user.coursesAuthored.push(id);
    var userData = fileops.getParsedData("data/users.json");
    userData
        .then((data) => {
            for(i of data) {
                if(i.username == req.session.user.username) {
                    i.coursesAuthored.push(id);
                    break;
                }
            }
            fs.writeFile("data/users.json", JSON.stringify(data), (err) => {
                if(err) console.log(err);
                return res.redirect("/home");
            });
        });
});

app.get("/list_courses", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    var unreg = fileops.getUnregisteredCourses(req.session.user);
    //console.log(unreg);
    unreg
        .then((data) => {
            res.render("list_courses", {
                courses: data
            });
        })
});

app.get("/register/:id", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    var course = fileops.courseDetails(req.params.id);
    course
        .then((data) => {
            res.render("register", {
                course: data,
                id: req.params.id
            });
        })
});

app.post("/register", (req, res) => {
    var id = req.body.id;
    var fac = req.body.prof;
    var promise = fileops.addCourse(id, fac, req.session.user);
    promise
        .then(() => {
            req.session.user.coursesRegistered[id] = fac;
            return res.redirect("/home");
        })
});

app.post("/delete", (req, res) => {
    if(!req.session.user) return res.redirect("/login");
    var id = req.body.id;
    if(req.body.type == "registered"){
        var promise = fileops.removeCourse(id, req.session.user);
        promise
            .then(() => {
                return res.redirect("/home");
            });
    }
    else {
        var promise = fileops.removeAuthoredCourse(id, req.session.user);
        promise
            .then(() => {
                return res.redirect("/home");
            });
    }
});

app.listen(8080);