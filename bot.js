

require('dotenv').config()


const Discord = require('discord.js');
const client = new Discord.Client();

var StreamPlayer = require('stream-player');
var player = new StreamPlayer();






client.on('ready', () => {

  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', message => {

    messageText = message.content

    if (messageText.startsWith("123")){
        player.add('http://path-to-mp3.com/example.mp3', metaData);

        // Start playing all songs added to the queue (FIFO)
        player.play();
    }
    

});



// login
client.login(process.env.token);