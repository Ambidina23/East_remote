var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
var robot = require("robotjs");
var clientIp;


// Chargement de la page index.html
app.get('/', function (req, res) {

    var ua = req.header('user-agent');
    // Check the user-agent string to identyfy the device. 
    if(/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
        res.sendFile(__dirname + '/public/mobile.html');
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }
  
  //res.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function (socket, pseudo) {
    // Récupérer l'adresse ip du serveur
    var socketId = socket.id;
    clientIp = socket.request.connection.remoteAddress;

    console.log(clientIp);


    socket.on('entrer',function(){
    	robot.keyToggle("control", 'down');
    	robot.keyTap("f");
    	robot.keyToggle("control", "up");
        
    })

});

//chemin pour servir les fichiers statiques
app.use(express.static('public'));

server.listen(8080,clientIp);