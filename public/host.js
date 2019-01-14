$(function (){
    // Connexion à socket.io
    var socket = io.connect();

    var form = $('form.login'),
        secretTextBox = form.find('input[type=text]'),
        file = form.find('input[id=fileURL]');
    var key = "";

    // Quand le formulaire est envoyé
    form.submit(function(e){

        e.preventDefault();
        // On recupere le mot de passe entré
        key = secretTextBox.val().trim();

        // Si il y a un mot de passe, on l'envoie au serveur pour enregistrement
            if(key.length) {
                socket.emit('setMdp', {
                    key: key
                });

                form.hide();
            }
        

    });

    
});