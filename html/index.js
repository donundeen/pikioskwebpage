let WEBSOCKET_PORT= 8088;
let WEBSERVER_PORT = 8080;

$(function() {

    console.log("starting");

    // chnage this depending on location of webserver. Figure out a way to make this more dynamic...
    let host =  window.location.host;
    host = host.replace(/:[0-9]+/,"");
    // remove port
    console.log(host);


    //  const ws = new WebSocket('ws://localhost:8080');
    //const ws = new WebSocket('ws://192.168.4.34:8080');
    //const ws = new WebSocket('ws://10.102.134.110:8080');
    const ws = new WebSocket('ws://'+host+':'+WEBSOCKET_PORT);

    let wsready = false;  
    // Browser WebSockets have slightly different syntax than `ws`.
    // Instead of EventEmitter syntax `on('open')`, you assign a callback
    // to the `onopen` property.
    ws.onopen = function() {
        wsready = true;
        console.log("opened " + ws.readyState);
        message("ready", "READY NOW")
    };

    ws.onerror = function(msg){
        console.log("ws error");
        console.log(msg);
    }

    ws.onclose = function(msg){
        console.log("wsclose");
        console.log(msg);
    }

    ws.onmessage = function(event) {
        console.log("got message ", event);
        msg = JSON.parse(event.data);
        console.log(msg.address);
        console.log(msg);

        if(msg.address == "/screen/text"){
            screenText(msg.data);

        }

    }

    function message(address, data){

        let msg = {address : address,
            data: data};  

        console.log("sending message ", msg);
        if(wsready){
        //    var buf = new Buffer.from(JSON.stringify(msg));
            ws.send(JSON.stringify(msg));
        }else{
            console.log("ws not ready");
        }
    }

    function screenText(data){
        console.log("screen text", data);
        $(".screentext").text(data.text);
    }

});

