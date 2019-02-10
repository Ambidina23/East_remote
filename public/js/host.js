$(function (){
    // Connexion à socket.io
    var socket = io.connect();

    // Envoie du message actualiserPresentations afin de répérer les dossiers de presentation
    socket.emit('actualiserPresentations');

    socket.on('presentations', function (files) {
        console.log(files);
        // Pour chaque dossier, on ajoute un input au formulaire
        for (var i=0; i<files.length; i++) {
            $( "#presentations" ).append( '<input id="'+files[i]+'" type="radio" name="file" value="'+files[i]+'"> <label for="'+files[i] +'">'+ files[i]+'</label>' );
        }
    });

    
});