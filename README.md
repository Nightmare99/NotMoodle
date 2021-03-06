 # NotMoodle
 Made using ExpressJS and friends.
 Only one type of user - can create courses as well as enroll in courses. Similar to Google Classrooms.
 ## Dependencies
 - NodeJS
 - NPM
 - ExpressJS
 - Body-parser
 - Cookie-parser
 - Express-session
 - Pug
 - Lodash
 
 ## Starting server
 Run the following command:
 ```npm start```
 
 Server starts at port ```8080```. Access using http://localhost:8080/
 
 Use the username ```test``` and password ```test123``` or username ```test2``` and password ```test456``` for testing.
 
 ## Features
 - Create new courses.
 - Join existing courses.
 - Drop joined courses.
 - View user profile.
 - View details about all courses.
 
 ## A brief peek under the hood
 There are 3 main components of this app:
 - The views (inside ```/views```) which are pug templates controlled by ```app.js```
 - The databases (inside ```/data```) which are json files
    - 2 files - one for users (```users.json```) and one for courses (```courses.json```). 
 - Business logic - mostly in ```fileops.js```
 
 ```fileops.js``` has most of the frequently used functions. They are described below:
 
 - ```createNewUser(user)``` - add new user details to users.json, used to implement new user registration.
 - ```getParsedData(filename)``` - read json file 'filename', parse its contents and return a javascript object.
 - ```getCourses(user)``` - return all course details of both the courses registered as well as authored by 'user'.
 - ```getUnregisteredCourses(user)``` - returns all the courses not registered by the user, useful to enumerate possibilities for registering new courses.
 - ```courseDetails(id)``` - returns course details for course with id='id'.
 - ```addCourse(id, prof, user)``` - adds course with id='id' to 'user' under professor 'prof'.
 - ```removeCourse(id, user)``` - Removes course with id='id' from 'user'.
 - ```removeAuthoredCourse(id, user)``` - Removes course from all users registered to it and removes it from the author's coursesAuthored list as well.
 
 ## Screenshots
 It's a big app, so I'm including only a few screenshots for representation's sake.

 Register:
 ![Login](/screenshots/Register_user.png)
 
 Login:
 ![Login](/screenshots/Login.png)
 
 Home:
 ![Home](/screenshots/Home.png)
 
 Profile:
 ![Profile](/screenshots/Profile.png)
 
 Register courses:
 ![Register](/screenshots/Register.png)
 ![Register1](/screenshots/Register2.png)
 
 Create a course:
 ![Create](/screenshots/Create.png)
 
 Drop a course:
 ![Drop](/screenshots/Drop.png)
