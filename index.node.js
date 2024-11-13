// runnign the system
// socketServer is the web page that gets control messages
const SocketServer = require("./modules/socketserver.module.js").SocketServer;

const db = require('./modules/debugging.module.js').Debugging;
// TURN DEBUGGING ON/OFF HERE
db.active = true;
db.trace = false;
db.log("starting","now",[1,2,3]);


let WEBSOCKET_PORT= 8088;
let WEBSERVER_PORT = 8080;
let UDPSENDPORT = 8090;
let UDPLISTENPORT = 8089;
let UDPSENDIP = "192.168.73.113";
let default_webpage = "index.html";

SocketServer.WEBSOCKET_PORT  = WEBSOCKET_PORT;
SocketServer.WEBSERVER_PORT  = WEBSERVER_PORT;
SocketServer.default_webpage = default_webpage;
socket = Object.create(SocketServer);
socket.db = db;


var osc = require("osc");
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: UDPLISTENPORT, // this port for listening
    broadcast: true,
    metadata: true
});

udpPort.open();


// handling messages over OSC/UDP
udpPort.on("message", function (oscMsg) {
    // when an OSC messages comes in
    db.log("An OSC message just arrived!", oscMsg);

    routeFromOSC(oscMsg, "/screen/text", function(oscMsg, address){

        db.log(oscMsg);
        socket.sendMessage(oscMsg.address,oscMsg.simpleValue);    
    });
    routeFromOSC(oscMsg, "/screen/p5", function(oscMsg, address){
        db.log(oscMsg);
        socket.sendMessage(oscMsg.address,oscMsg.simpleValue);    
    });
    routeFromOSC(oscMsg, "/screen/html", function(oscMsg, address){
        db.log(oscMsg);
        socket.sendMessage(oscMsg.address,oscMsg.simpleValue);    
    });



});

let address = "/announcecreen/here";
let args = [{type: "s", value: "teset here"}];
let bundle = {
    timeTag: osc.timeTag(1),
    packets :[{
        address: address,
        args: args
    }]
}
db.log("sending udp message " + address, args, UDPSENDIP, UDPSENDPORT);
// send prop to all devices, but route will only be accepted by the one with the same name 
udpPort.send(bundle, UDPSENDIP, UDPSENDPORT);    


        

socket.setMessageReceivedCallback(function(msg){

    // this is the format for handling messages.
    // getscore ask for the contents and name of the current score
    routeFromWebsocket(msg, "ready", function(msg){    
        
        console.log("got ready message");
        let data = {msg : "hello",
                text: "more text"};
        socket.sendMessage("hithere",data);    
    });

    routeFromWebsocket(msg, "adminmessage", function(msg){    
        
        console.log("got admin message");
        let data = msg;
        socket.sendMessage(msg.address,data);    
    });


    routeFromWebsocket(msg, "toadminmessage", function(msg){    
        
        console.log("got toadmin message");
        let data = msg;
        socket.sendMessage(msg.address,data);    
    });    

    // get admin page messages to send to the screen
});


// some websocket messages come in with a word preceding them, 
// which helps determine what they mean and where they should go.
// pass to Route to send to a specific callback.
// return true if the route was a match, false otherwise.
function routeFromWebsocket(msg, route, callback){
    let channel = false;
    let newmsg = false;
    if(msg.address){
        channel = msg.address; 
        newmsg = msg.data;       
    }else{
        let split = msg.split(/ /);
        channel = split.shift();
        newmsg = split.join(" ");
    }
    if(channel.toLowerCase() == route.toLowerCase()){
        callback(newmsg);
        return true;
    }
    return false;
}


/////////////////////////////////////////
// routing function for handling all OSC messages
// oasMsg : osc message, with .address and .args address provided
// route : string or regex to match the address
// args: the message content
// callback function(oscMsg, routematches)
// -- the orginal OSCMsg, with propery simpleValue added, 
//    which is the best we could do to get the sent message value as a simple value or JSON array
// -- the address split into an arrqy on /
function routeFromOSC(oscMsg, route, callback){

    // get teh OSC value. Need to figure out types here, 
    let value = oscMsg.args;
    let newvalue = false;
/*
    db.log("got oscMsg " + value, value);
    db.log(oscMsg);
    db.log(typeof value);
*/
    if(typeof value == "number"){
        newvalue = value;
    }else if(Array.isArray(value) && value.length == 1 && Object.hasOwn(value[0], "value")){
        if(value[0].type == "s"){
            try{
                newvalue = JSON.parse(value[0].value);
            }catch(e){
                newvalue = value[0].value;
            }
        }else{
            newvalue = value[0].value;
        }
    }else if(Array.isArray(value) && value.length > 1 && Object.hasOwn(value[0], "value")){
        newvalue = [];
        for(let i = 0; i < value.length; i++){
            if(value[0].type == "s"){
                try{
                    newvalue[i] = JSON.parse(value[i].value);
                }catch(e){
                    newvalue[i] = value[i].value;
                }
            }else{
                newvalue[i] = value[i].value;
            }
        }
    }else{
        db.log("!!!!!!!!!!!!!! ");
        db.log("don't know what value is " + Array.isArray(value) + " : " + value.length + " type :" + typeof value);
    }

    oscMsg.simpleValue = newvalue;

    let matches = oscMsg.address.match(route);
    if(matches){
        let split = oscMsg.address.split("/");
        callback(oscMsg, split);
    }
}


// start the socket server and the web server
socket.startSocketServer();
socket.startWebServer();