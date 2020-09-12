var app  = require('express')();
var http = require('http').Server(app);
var io 	 = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var users = {};
var usernames = [];

io.on('connection', function(socket){
	socket.on('newMessage', function(msg){
		io.emit('newMessage', msg);
		console.log('New chat : ' + msg);
	});

	socket.on('disconnect', function(msg){
		console.log('user disconnected');
	});

	socket.on('registerUser', function(username){
		if ( usernames.indexOf(username) != -1 ){
			console.log('username founded');
			socket.emit('registerRespond', false);
		} else {
			users[socket.id] = username;
			usernames.push(username);
			console.log('new user has registered');
			socket.emit('registerRespond', true);
			io.emit('addOnlineUsers', usernames);
		}
	});

	socket.on('disconnect', function(msg){
		socket.broadcast.emit('newMessage', users[socket.id] + ' left the chat');
		var index = usernames.indexOf(users[socket.id]);
		usernames.splice(index, 1);
		delete users[socket.id];
		
		io.emit('addOnlineUsers', usernames);
	});
});

http.listen(3000, function(){
	console.log('listening on port 3000...');
});