

require('dotenv').config()
const http = require("http")
const fs = require('fs')


const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {

  console.log(`Logged in as ${client.user.tag}!`);
});

let playConn =(connection) => {
    connection.play(fs.createReadStream(__dirname + "/TakeItBack.mp3"));
    console.log("playing stream")
    }


client.on('message', message => {

    messageText = message.content

    if (messageText.startsWith("123")){

        url = messageText.split(" ")[1]

        if (message.member.voice.channel) {
            message.member.voice.channel.join().then(playConn).catch(error => {
            
                message.member.voice.channel.join().then(playConn).catch(console.log)
            });

            

            
        } else {
            message.channel.send('You need to join a voice channel first!');
        }

        

        

    }
    

});


// login
client.login(process.env.botToken);