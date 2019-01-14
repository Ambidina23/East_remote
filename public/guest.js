$(function (){
    // Connexion à socket.io
    var socket = io.connect();
 
    // Lorsqu'on clique sur l'image
    $("#droite").click(function(){
        socket.emit('suivant'); // Transmet le message 
    });
    // Lorsqu'on clique sur l'image
    $("#gauche").click(function(){
        socket.emit('precedent'); // Transmet le message
    });
    // Lorsqu'on clique sur l'image
    $("#haut").click(function(){
        socket.emit('debut'); // Transmet le message
    });
    // Lorsqu'on clique sur l'image
    $("#bas").click(function(){
        socket.emit('fin'); // Transmet le message
    });
    // Lorsqu'on clique sur l'image
    $("#zoom").click(function(){
        socket.emit('zoom'); // Transmet le message
    });
    // Lorsqu'on clique sur l'image
    $("#dezoom").click(function(){
        socket.emit('dezoom'); // Transmet le message
    });

    var form = $('form.login'),
        secretTextBox = form.find('input[type=text]');
    var key = "";

    // Quand le formulaire est envoyé
    form.submit(function(e){

        e.preventDefault();
        // On recupere le mot de passe entré
        key = secretTextBox.val().trim();

        // Si il y a un mot de passe, on l'envoie au serveur pour vérification
            if(key.length) {
                socket.emit('checkMdp', {
                    key: key
                });
            }

        

    });

    // Le serveur authorise ou pas l'acces à la télécommande
      socket.on('access', function(data){

        if(data.access === "granted") {
            form.hide();
        }
        else {            
            location.reload();
        }
    });
});