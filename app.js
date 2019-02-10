// Modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var robot = require("robotjs");
var bodyParser = require('body-parser');
var path = require("path");
var fs = require("fs");

// Variables
var clientIp;
var mdp='';
var file;
var liste;
var screenWidth = 1440;
var screenHeight = 900;
var adjustment;

// Permet de lire le JSON renvoyé par un formulaire
app.use(bodyParser.urlencoded({ extended: true }));

// Récuperer la résolution de l'hote afin d'obtenir une valeur d'ajustement pour le mouvement de la souris
try {
    screenWidth = robot.getScreenSize().width;
    screenHeight = robot.getScreenSize().height;
    adjustment = screenHeight/200;
} catch (e) {
    console.log(e);
}

// Chargement de la page index.html
app.get('/', function (req, res) {

    var ua = req.header('user-agent');
    // Redirection sur la page contenant la télécommande pour les appareils mobiles
    if(/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
        res.sendFile(__dirname + '/public/mobile.html');
    } else {  // Sinon redirection sur la page contenant l'interface pour la présentation
        res.sendFile(__dirname + '/public/index.html');
        // On reset le mot de passe afin que la télécommande ne soit plus disponible en cas de chargement d'une nouvelle présentation
        mdp='';
        // On appelle la fonction pour lister les dossiers contenu dans le dossier présentations
        allPresentation();
    }
  
});

app.get("/presentation", function(req, res){
    // On lit le dossier selectionné
    fs.readdir(path.join(__dirname, "./presentations/"+file), (err, files) => {
        if (err) return err;
        // On parcourt les fichiers du dossier afin de trouver le fichier html de la présentation
        for (var i=0; i<files.length; i++) {
            if(path.extname(files[i]).toLowerCase() === ".html") {
                // Chemin pour servir les fichiers statiques de la présentation choisie
                app.use(express.static('presentations/'+file));
                // Redirection sur la présenation choisie
                return res.sendFile(path.join(__dirname, "./presentations/"+file+"/"+files[i]));
            }
        }
        return res
          .status(500)
          .contentType("text/plain")
          .end("Aucun fichier .html n'a été trouvé");     
    });

    
});

app.post("/", function(req, res){
    // On récupére les données du formulaire afin de définir le mot de passe et le dossier de la présentation
    mdp=req.body.mdp;
    file=req.body.file;
    // Puis on redirige vers la présentation
    res.redirect('/presentation');
});


io.sockets.on('connection', function (socket) {
    // Récupérer l'adresse ip
    var socketId = socket.id;
    clientIp = socket.request.connection.remoteAddress;

    console.log(clientIp);

    // Quand le serveur recoit le message clic, on simule le clic gauche
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
            // Si l'hote est un Mac on effectue la combinaison command et +
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
            // Si l'hote est un Mac on effectue la combinaison command et -
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

    // Quand le serveur recoit le message actualiserPresentations
    socket.on('actualiserPresentations', function(){
        // On appelle la fonction pour lister les dossiers contenu dans le dossier présentations
        allPresentation();
        // On renvoie un message presentations avec la liste
        socket.emit('presentations',liste);
    });
});

// Fonction permettant à lister les présentations contenues dans le dossier présentations
function allPresentation() {
    fs.readdir(path.join(__dirname, "./presentations/"), (err, files) => {
        if (err) return err;
        liste=files;
    });
}

//Chemin pour servir les fichiers statiques
app.use(express.static('public'));

server.listen(8080,clientIp);