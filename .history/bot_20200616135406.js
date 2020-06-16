require('dotenv').config()
const http = require("http")

const Discord = require('discord.js');
const client = new Discord.Client();

const prefix = 'DJ'
const maxConnectionRetries = 3

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

});

client.on("error", (error) => {
    console.log(error)
})

let requestTimeout = null;
let connection = null;

let connectionNumber = 0
let isConnected = false

let globalLog = (discordMessage, textMessage) => {
    discordMessage.channel.send(textMessage)
    console.log(textMessage)
}


let playStream = async (url,message) => {
    
    http.get(url).on('response', async (incomingMessage) => {
        console.log(incomingMessage.headers)

        if (incomingMessage.headers["content-type"] === "application/ogg"){
            // counts how many times connection is sucessfull
            connectionNumber = connectionNumber + 1;
            isConnected = true
            connection = await getConnection(message)
            console.log("connection received")

            if (connectionNumber == 1){
                globalLog(message,"stream started")

            } else {
                globalLog(message,"stream resumed")
            }

            connection.play(incomingMessage)
            clearTimeout( requestTimeout)
        }
        
        

    }).on("close",() => {
        message.member.voice.channel.leave();

        if (isConnected){
            globalLog(message,"stream stopped")
            isConnected = false
        }

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
        globalLog(message,error.message)
    }
}

let disconnectStream = (message) => {
    try {
        message.member.voice.channel.leave();
        globalLog(message,"stream stopped")
        connectionNumber = 0
        isConnected = false

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
        globalLog(message,'You need to join a voice channel first!');
    }        


}

// login
client.login(process.env.botToken);
//botToken=NzEzMzM2ODE0MTA2MDUwNjgx.Xse9Lw.L_22TQfJchwIN8UL6MYoC2hbm4E