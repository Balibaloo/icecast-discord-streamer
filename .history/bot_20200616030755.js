require('dotenv').config()
const http = require("http")

const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = 'DJ'
const maxConnectionRetries = 3

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

});

let requestTimeout = null;
let connection = null;
let connectionNumber = 0


let playStream = async (url,message) => {
    
    http.get(url).on('response', async (incomingMessage) => {
        console.log(incomingMessage.headers)

        if (incomingMessage.headers["content-type"] === "application/ogg"){
            // counts how many times connection is sucessfull
            connectionNumber = connectionNumber + 1;
            connection = await getConnection(message)
            console.log("connection received")

            console.log(connectionNumber)
            if (connectionNumber == 1){
                message.channel.send("stream started")

            } else {
                message.channel.send("stream resumed")
            }

            connection.play(incomingMessage)
            clearTimeout( requestTimeout)
        }
        
        

    }).on("close",() => {
        message.member.voice.channel.leave();
        message.channel.send("stream stopped")
        console.log("stream stopped")

        requestTimeout = setTimeout((message,ulr) => {
            playStream(ulr,message)
        },2 *1000,message,url)
        
    }).on("continue", () => {
        console.log("continue")
    })
}

let getConnection = async (message, tryNumber = 0) => {

        try {    
            return await message.member.voice.channel.join()
        
        } catch (e) {
            
            if (tryNumber == maxConnectionRetries) {

                throw e
                

            }  else {
                return await getConnection(message ,tryNumber + 1)
            }

            
        }   
}

let tryPlayStream = async (message,url) => {

    

    try{
        playStream(url,message)

    } catch (error) {
        console.log(error)
        message.channel.send(error.message)
    }
}

let disconnectStream = (message) => {
    try {
        message.member.voice.channel.leave();
        message.channel.send("stream stopped")
        let connectionNumber = 0

    } catch(error) {
        console.log(error)
    }
}



let messageCommandEquals = (command,mesageText) => {
    return mesageText.startsWith(prefix + " " + command)
}

client.on('message', message => {
    if (message.content.startsWith(prefix)){
        handleCommand(message)
    }
});


let handleCommand = async (message) => {
    mesageText =  message.content

    if (message.member.voice.channel) {
    
        if (messageCommandEquals("stream",mesageText)){

            url = mesageText.split(" ")[2]
            tryPlayStream(message,url)

        } else if (messageCommandEquals("balibaloo",mesageText)) {
            tryPlayStream(message,"http://localhost:8000/music-and-shit.ogg")

        } else if (messageCommandEquals("stop",mesageText)) {
            disconnectStream(message)
        }

    } else {
        message.channel.send('You need to join a voice channel first!');
    }        


}

// login
client.login(process.env.botToken);