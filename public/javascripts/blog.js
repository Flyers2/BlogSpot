
var socket = io('http://162.243.45.239/'),
    recievedArticles = false;


socket.on('message', function(data) {
    if (!recievedArticles) {
        recievedArticles = true;
        console.log("recieving messages");
        $.each(data, function(index, eachData) {
            var ablog = $('<article  id = ' + eachData._id + '> <h2>' + eachData.title + ' </h2>' +
                '<div class="article-info" >Posted on ' + eachData.time + ' by ' + eachData.name + '</div>' +
                '<div><p>' + eachData.message + '</p>' +
                '</div>' +
                '<div class=theComments></div>');
            if (eachData.comments) {

                $.each(eachData.comments, function(index, comment) {
                    //console.log("adding comment to div"+ comment.comment)
                    ablog.find("div.theComments").append('<div>' + comment.comment + '</div>' +
                        '<div class ="article-info">' +
                        'by ' + comment.author + ' at ' + comment.time + '</div>');
                });
            }
            ablog[0].innerHTML += '</div>' +
                '<input type ="submit"  class ="addComment" value="add comment" >' +
                '<div class="addAComment">' +
                'Comment:' +
                '<input type="text" id="addYourComment placeholder="Enter your comment here"/>' +
                ' Your Name:' +
                '<input type="text" id="authorOfComment" placeholder="Enter your name here"/>' +
                '<button class="submit">submit</button>' +
                '<button class="cancel">cancel</button>' +
                '</div>' +
                '</article>';

            var messageID = eachData._id;
            console.dir(ablog + " this is a new blog");
            $("#content").prepend(ablog);

            $(".addComment").click(function() {
                $(this).next().show();
                console.log("clicked on addcomment");
            });

            $(".cancel").click(function() {
                $(this).parent().hide();
            });

            $(".submit").click(function() {
                console.log("submit comment " + messageID);
                var parent = $(this).parent(),
                    inputs = parent.find('input[type="text"]'),
                    comment = inputs[0].value,
                    author = inputs[1].value;
                console.log(comment + author);
                socket.emit("comment", {
                    comment: comment,
                    author: author,
                    commentID: messageID
                });
                parent.hide();
            });





            $(this).parent().hide();
        });
    }



});


socket.on("comment", function(comment) {
    console.log("got back comment");
    $('#' + comment.commentID).find('div.theComments').append('<div>' + comment.comment + '</div>' +
        '<div class ="article-info">' +
        'by ' + comment.author + ' at ' + comment.time + '</div>');
});


$(function() {
    console.log("js loaded");
    var name = 'john Doe',
        //topic = 'you forgot to pick a topic';
        message = 'default message',
        date = new Date();
    $('#newBlog').click(function() {
        date = new Date();
        // console.log(name + date + topic);
        if ($('#enterAuthor').val() === '' || $('#enterTitle').val() === '' || $('#enterContents').val() === '') {
            alert("please fill out all fields");
            return;
        }
        socket.emit('message',
            {name: $('#enterAuthor').val(),
                time: (date.getMonth() + 1) + '/' + date.getDate() + '/' + (date.getYear() - 100),
                title: $('#enterTitle').val(),
                message: $('#enterContents').val()
            });
        socket.on("completed", function() {
            window.location.href = "index.html";
        })

    });


});

