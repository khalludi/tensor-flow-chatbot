var app = require('express')(),
  server  = require("http").createServer(app),
  io = require("socket.io")(server),
  sess_id = {},
  session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");

var http = require("http")

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Attach session
app.use(session);

// Share session with io sockets

io.use(sharedsession(session));

io.on("connection", function(socket) {
    // Accept a login event with user's data
    
    socket.on("login", function(userdata) {
        console.log(socket.id);
	socket.handshake.session.userdata = userdata;
        socket.handshake.session.save();

	//var dat2 = {"message":"When is the store open?", "context": {}, "user-id": 123}
	var data = {
                     "message": userdata,
                     "user-id": socket.id
                   };

	var request = require("request")
	request({
    	  method: 'POST',
    	  url: 'http://127.0.0.1:5000/tf_model/predict',
    	  // body: '{"foo": "bar"}'
    	  json: data
	}, (error, response, body) => {
    	  console.log(error);
      	  // console.log(response);
    	  console.log(body);
	  socket.emit("chat message", body["message"])
	});

	/*console.log(dat2);
        var options = {
          host: 'localhost',
          port: 5000,
          path: '/tf_model/predict',
          method: 'POST',
          json: {"message":"When is the store open?", "context": {}, "user-id": 123},
	  headers: {
            'Content-Type': 'application/json'
          }
        };

        var request = http.request(options, function (res) {
	  console.log('Status: ' + res.statusCode);
          console.log('Headers: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (body) {
            console.log('Body: ' + body);
	  });
        });
	//request.write(dat2);
	request.end()
	/*
	request.on("response", function(err, res, body)
        {
           if (!err && res.statusCode === 200) {
               console.log(body);
	   }
	   //console.log(err);
	   //console.log(res);
	   console.log(body);
	   socket.emit("chat message", body)
        });
        */
    });
    socket.on("logout", function(userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });        
});

server.listen(3000);
