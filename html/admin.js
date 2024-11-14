let WEBSOCKET_PORT= 8088;
let WEBSERVER_PORT = 8080;

$(function() {

    console.log("starting");

    // chnage this depending on location of webserver. Figure out a way to make this more dynamic...
    let host =  window.location.host;
    host = host.replace(/:[0-9]+/,"");
    // remove port
    console.log(host);



    $(".sendmessage").on("click", function(evt){
        console.log("clicked");
        let context = $(evt.target).parent();
        let address = $(".address", context).val();
        if(address == "/screen/text/"){
            sendScreenText(context);
        }
        if(address == "/screen/js/"){
            sendJS(context);
        }
        if(address == "/screen/html/"){
            sendHTML(context);
        }
        console.log(address);
    })

    function sendScreenText(context){
        let address = $(".address", context).val();
        let text =  $(".text", context).val();       
        let data = {address: address,
                    text: text};

        message("adminmessage", data);
    }

    function sendJS(context){
        $(".errormsg", context).empty();
        let address = $(".address", context).val();
        let js =  $(".js", context).val();       
        let data = {address: address,
                    js: js};

        message("adminmessage", data);
    }    

    function sendHTML(context){
        $(".errormsg", context).empty();
        let address = $(".address", context).val();
        let html =  $(".html", context).val();       
        let data = {address: address,
                    html: html};

        message("adminmessage", data);
    }      
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
        message("ready", "ADMIN READY NOW")
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
        if(msg.address == "jsError"){
            showJSError(msg);
        }
        console.log(msg.address);
        console.log(msg);

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

    function showJSError(msg){
        console.log("jsError", msg.data);
        $(".jsError").text("ERROR: " + msg.data.msg);
    }

});

