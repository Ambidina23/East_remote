var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var robot = require("robotjs");
var clientIp;
var mdp='';
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oh, il y a un soucis :(");
};

// Definition du répertoire utilisé par Multer
const upload = multer({
  dest: __dirname + '/upload'
});

var screenWidth = 1440;
var screenHeight = 900;
var adjustment = screenHeight/200;
// Récuperer la résolution de l'hote
try {
    screenWidth = robot.getScreenSize().width;
    screenHeight = robot.getScreenSize().height;
} catch (e) {
    console.log(e);
}

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/presentation", function(req, res){
  res.sendFile(path.join(__dirname, "./upload/presentation.html"));
});

app.post("/upload",upload.single("file" /* name attribute of <file> element in your form */),(req, res) => {
    
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./upload/presentation.html");

    if (path.extname(req.file.originalname).toLowerCase() === ".html") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        mdp=req.body.mdp;
        console.log('setMdp : '+mdp);
        res.redirect('/presentation');
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Seul les fichiers .html sont acceptés");
      });
    }
  }
);

io.sockets.on('connection', function (socket) {
    // Récupérer l'adresse ip
    var socketId = socket.id;
    clientIp = socket.request.connection.remoteAddress;

    console.log(clientIp);

    // Quand le serveur recoit le message précédent, on simule le clic gauche
    socket.on('clic',function(data){
        if(data.key === mdp) {
            robot.mouseClick();
        }       
    })

    // Quand le serveur recoit le message précédent, on simule la touche gauche
	socket.on('precedent',function(data){
        robot.keyTap("left");       
    })

    // Quand le serveur recoit le message suivant, on simule la touche droite
    socket.on('suivant',function(data){
        if(data.key === mdp) {
            robot.keyTap("right");  
        }
    })

    // Quand le serveur recoit le message debut, on simule la touche home
    socket.on('debut',function(data){
        if(data.key === mdp) {
            robot.keyTap("home");
        }
    })

    // Quand le serveur recoit le message fin, on simule la touche end
    socket.on('fin',function(data){
        if(data.key === mdp) {
            robot.keyTap("end");
        }
    })

    // Quand le serveur recoit le message zoom, on simule la combinaison de touche ctrl et +
    socket.on('zoom',function(data){
        if(data.key === mdp) {
            if(process.platform == "darwin") {
                robot.keyTap('+', 'command');
            }else{
                robot.keyToggle("control", 'down');
                robot.keyTap("+");
                robot.keyToggle("control", "up");
            }
        }
        
    })

    // Quand le serveur recoit le message dezoom, on simule la combinaison de touche ctrl et -
    socket.on('dezoom',function(data){
        if(data.key === mdp) {
            if(process.platform == "darwin") {
                robot.keyTap('-', 'command');
            }else{
                robot.keyToggle("control", 'down');
                robot.keyTap("-");
                robot.keyToggle("control", "up");
            }
        }
        
    })


    // Quand le serveur recoit le message souris, on simule le mouvement du curseur
    socket.on('souris',function(data){
        if(data.key === mdp) {

            var x = data.x;
            var y = data.y;

            robot.moveMouse(adjustment * x, adjustment * y);
        }
        
    })

    // Quand le serveur recoit le message checkMdp
    socket.on('checkMdp', function(data){
    	// On vérifie si le mot de passe entré dans la télécommande correspond afin d'autoriser l'utilisation
        socket.emit('access', {
            access: (data.key === mdp ? "granted" : "denied")
        });
        console.log('checkMdp : '+data.key+" ?");
    });



});

//Chemin pour servir les fichiers statiques
app.use(express.static('upload'));
app.use(express.static('public'));

server.listen(8080,clientIp);