var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var iosocket = require('socket.io');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongo = require('mongodb');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error(' it\'s Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

console.log("test");
var io = iosocket.listen(app.listen(8082));
io.on("connection", function(socket) {
    console.log("client connected");
    var blog; 
    mongo.MongoClient.connect("mongodb://localhost:27017/blog",
        function(err, db) {
            if (err) {
                console.log("error connection with mongo: " + err);
                return;
            }
            console.log("connected to mongo");
            blog = db.collection('blog');
            blog.find().toArray(function(err, messages) {//.sort({_id: -1})
                //console.dir(messages);
                socket.emit("message", messages);
              
            });
            socket.on("message", function(data) {
                console.dir(data);
                console.log("data sent to us is "+data);
                blog.insert(data, function(err) {
                    if (err) {
                        console.log("error writing to db: " + err);
                    } else {
                        console.log("inserted");
                    }
                });
                //io.emit("message", [data]);
                socket.emit("completed")
            });
            socket.on("comment", function(data) {
                date = new Date();
                console.log("got comment");
                var theId = new mongo.BSONPure.ObjectID(data.commentID),
                    commentInfo = {
                        time: date.getMonth() + 1 + '/' + date.getDate() + '/' + (date.getYear()-100),//new Date().getTime(),
                        comment: data.comment,
                        author: data.author,
                        commentID: data.commentID
                    };
                console.dir(commentInfo);
                blog.update({_id: theId}, {
                    $push: {comments: commentInfo}
                }, function(err, result) {
                    if (err) {
                        return console.warn(err);
                    }
                    else {
                        console.log("added comments and sending");
                        io.emit("comment", commentInfo);
                    }
                });
            });
        });

});

module.exports = app;