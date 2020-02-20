const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const readFile = util.promisify(fs.readFile);

function getParsedData(filename) {
    const promise = new Promise((resolve, reject) => {
        let users = readFile(filename, "utf-8");
        users
            .then((data) => {
                let Data = JSON.parse(data);
                resolve(Data);
            })
    });
    return promise;
}

function getCourses(user) {
    const prom = new Promise((resolve, reject) => {
        let promise = readFile("data/courses.json", "utf-8");
        let regCourses = [];
        let authCourses = [];
        let courses = user.coursesRegistered;
        let authored = user.coursesAuthored;
        //console.log(authored);
        promise
            .then((data) => {
                let courseData = JSON.parse(data);
                for(i in courses) {
                    let temp = courseData[i];
                    //console.log(temp);
                    temp.id = i;
                    temp.offeredBy = courses[i];
                    regCourses.push(temp);
                    //console.log(courseData[i]);
                }
                for(i of authored) {
                    let temp2 = courseData[i];
                    temp2.id = i;
                    temp2.offeredBy = user.name;
                    authCourses.push(temp2);
                }
                //console.log(regCourses);
                resolve([regCourses, authCourses]);
            })
            .catch((err) => console.log(err));  
    });
    return prom;
}

function getUnregisteredCourses(user) {
    const promise = new Promise((resolve, reject) => {
        let courses = getParsedData("data/courses.json");
        res = [];
        temp = {};
        courses
            .then((data) => {
                //console.log(data);
                for(i in data) {
                    console.log(i);
                    if(!Object.keys(user.coursesRegistered).includes(i) && !user.coursesAuthored.includes(i)) {
                        temp = data[i];
                        temp.id = i;
                        res.push(temp);
                        //console.log(temp);
                        temp = {};
                    }
                }
                resolve(res);
            });
    }); 
    return promise;
}

function courseDetails(id) {
    const promise = new Promise((resolve, reject) => {
        let prom = readFile("data/courses.json", "utf-8");
        prom
            .then((data) => {
                let courseData = JSON.parse(data);
                let course = courseData[id];
                resolve(course);
            })
            .catch((err) => console.log(err));
    });
    return promise;
}

function addCourse(id, prof, user) {
    const promise =  new Promise((resolve, reject) => {
        let users = getParsedData("data/users.json");
        users
            .then((data) => {
                for(i of data) {
                    if(i.username == user.username) {
                        i.coursesRegistered[id] = prof;
                        break;
                    }
                }
                fs.writeFile("data/users.json", JSON.stringify(data), (err) => {
                    if(err) console.log(err);
                    resolve();
                });
            });
    });
    return promise;
}

function removeCourse(id, user) {
    user.coursesRegistered = _.omit(user.coursesRegistered, id);
    const promise = new Promise((resolve, reject) => {
        let users = getParsedData("data/users.json");
        users
            .then((data) => {
                for(i of data) {
                    if(i.username == user.username) {
                        i.coursesRegistered[id] = undefined;
                        i.coursesRegistered = JSON.parse(JSON.stringify(i.coursesRegistered));
                        console.log(id);
                        console.log(i.coursesRegistered);
                        break;
                    }
                }
                fs.writeFile("data/users.json", JSON.stringify(data), (err) => {
                    if(err) console.log(err);
                    resolve();
                });
            });
    });
    return promise;
}

function removeAuthoredCourse(id, user) {
    user.coursesAuthored.splice(user.coursesAuthored.indexOf(id), 1 );
    const promise = new Promise((resolve, reject) => {
        let users = getParsedData("data/users.json");
        users
            .then((data) => {
                for(i of data) {
                    if(i.username == user.username) {
                        i.coursesAuthored.splice(i.coursesAuthored.indexOf(id));
                    }
                    else {
                        i.coursesRegistered[id] = undefined;
                        i.coursesRegistered = JSON.parse(JSON.stringify(i.coursesRegistered));
                    }
                }
                fs.writeFile("data/users.json", JSON.stringify(data), (err) => {
                    if(err) console.log(err);
                });
                let courses = getParsedData("data/courses.json");
                courses
                    .then((data) => {
                        data[id] = undefined;
                        data = JSON.parse(JSON.stringify(data));
                        fs.writeFile("data/courses.json", JSON.stringify(data), (err) => {
                            if(err) console.log(err);
                            resolve();
                        });
                    });
            });
    });
    return promise;
}

function createNewUser(user) {
    const promise = new Promise((resolve, reject) => {
        let users = getParsedData("data/users.json");
        users
            .then((data) => {
                for(i of data) if(i.username == user.username) reject();
                data.push(user);
                fs.writeFile("data/users.json", JSON.stringify(data), (err) => {
                    if(err) console.log(err);
                    resolve();
                });
            });
    });
    return promise;
    
}

module.exports.createNewUser = createNewUser;
module.exports.getCourses = getCourses;
module.exports.getParsedData = getParsedData;
module.exports.courseDetails = courseDetails;
module.exports.getUnregisteredCourses = getUnregisteredCourses;
module.exports.addCourse = addCourse;
module.exports.removeCourse = removeCourse;
module.exports.removeAuthoredCourse = removeAuthoredCourse;