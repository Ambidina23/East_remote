# East_remote


Réalisé par Moussa Ambidina, Sema Sunner, Thomas Petrucci et Jennifer Testu

Compatible Windows, Linux et Mac


Il est composé d’un serveur (ordinateur) et d’un client (appareil mobile). A la manière d’une télécommande, l’application Web du client permet de contrôler à distance une présentation EAST hébergée sur le serveur avec Node.js via Websockets. 

L’application envoie un signal au serveur pour dire l’action à effectuer sur la présentation. Les actions disponibles sont les suivantes : suivant, précédent, début, fin, zoom, dézoom, clic gauche. Afin de reproduire ces actions, un module est utilisé permettant de simuler le comportement d’un clavier.
