var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var robot = require("robotjs");
var clientIp;
var mdp='';

// Chargement de la page index.html
// Chargement de la page index.html
app.get('/', function (req, res) {

    var ua = req.header('user-agent');
    // Redirection sur la page contenant la télécommande pour les appreils mobiles
    if(/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
        res.sendFile(__dirname + '/public/mobile.html');
    } else {
        res.sendFile(__dirname + '/public/index.html');
    }
  
});

io.sockets.on('connection', function (socket) {
    // Récupérer l'adresse ip
    var socketId = socket.id;
    clientIp = socket.request.connection.remoteAddress;

    console.log(clientIp);

    // Quand le serveur recoit le message précédent, on simule la touche gauche
	socket.on('precedent',function(){
        robot.keyTap("left");       
    })

    // Quand le serveur recoit le message suivant, on simule la touche droite
    socket.on('suivant',function(){
        robot.keyTap("right");  
    })

    // Quand le serveur recoit le message debut, on simule la touche home
    socket.on('debut',function(){
        robot.keyTap("home");
    })

    // Quand le serveur recoit le message fin, on simule la touche end
    socket.on('fin',function(){
        robot.keyTap("end");
    })

    // Quand le serveur recoit le message zoom, on simule la combinaison de touche ctrl et +
    socket.on('zoom',function(){
        robot.keyToggle("control", 'down');
        robot.keyTap("+");
        robot.keyToggle("control", "up");
        
    })

    // Quand le serveur recoit le message dezoom, on simule la combinaison de touche ctrl et -
    socket.on('dezoom',function(){
        robot.keyToggle("control", 'down');
        robot.keyTap("-");
        robot.keyToggle("control", "up");
        
    })

    // Quand le serveur recoit le message checkMdp
    socket.on('checkMdp', function(data){
    	// On vérifie si le mot de passe entré dans la télécommande correspond afin d'autoriser l'utilisation
        socket.emit('access', {
            access: (data.key === mdp ? "granted" : "denied")
        });

    });

	// Quand le serveur recoit le message setMdp
    socket.on('setMdp', function(data){
    	// On définie le mot de passe
        mdp=data.key;

    });

});

//Chemin pour servir les fichiers statiques
app.use(express.static('public'));

server.listen(8080,clientIp);