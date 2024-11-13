let WEBSOCKET_PORT= 8088;
let WEBSERVER_PORT = 8080;

let contentdiv = false;

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
        if(msg.address == "/screen/p5"){
            console.log(msg);
            // Draw square
            // x, y, size
            let p5 = msg.data.p5;
          //  square(40, 100, 200);
            try{
                eval(p5);
            }catch(e){
                console.log("p5 error", e);
                let msg = {msg : e.message, p5code: p5, address : "p5error"};
                message("toadminmessage", msg);
            } 
        }

        if(msg.address == "/screen/html"){
            console.log(msg);
            // Draw square
            // x, y, size
            let html = msg.data.html;
          //  square(40, 100, 200);
            try{
                addHTML(html);

            }catch(e){
                console.log("html error", e);
                let msg = {msg : e.message, html: html, address : "p5error"};
                message("toadminmessage", msg);
            }
        }        

        // try parsing a json object into a series of javascript function calls. maybe it will work?
        if(msg.address == "/screen/p5json"){
            let p5json = msg.data.p5json;
            for(let i = 0 ; i< p5json.length; i++){
                let farray=[];                
                let fstring = false;
                let func = p5json[i];
                if(func.t){
                    fstring = func.t;
                }else{
                    let fname = func.f;
                    let argarray = [];
                    for(let j = 0; j < func.args.length; j++){
                        let arg = func.args[j];
                        console.log(typeof arg);
                        if(typeof arg === "string"){
                            argarray.push( "'"+arg+"'");
                        }else{
                            argarray.push(arg);
                        }
                    }
                    let argstring = argarray.join(", ");
                    fstring = fname+"("+argstring+");"
                }
                try{
                    console.log("eval", fstring);
                    eval(fstring);
                }catch(e){
                    console.log("p5json error", e);
                    let msg = {msg : e.message, fstring: fstring, func: func, p5json : p5json, address : "p5error"};
                    message("toadminmessage", msg);
                }            
            }
        }
    }


    function addHTML(htmlstring){
        let newelem = document.createElement("div");
        newelem.innerHTML = htmlstring;
        newelem.style.position = "absolute";
        contentdiv.append(newelem);
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


function setup() {
    // Create screen reader accessible description
    textOutput();
  
    createCanvas(screen.width, screen.height);
    // Use degrees as units for angles
    // The arc() function uses angles
    angleMode(DEGREES);
  
    // Draw a light gray background
    background(240);
  

    contentdiv = document.createElement("div");
    contentdiv.setAttribute("id", "contentdiv");
    contentdiv.classList.add("contentdiv");    
    contentdiv.style.position = "absolute";
    contentdiv.style.top = 0;
    contentdiv.style.lefft = 0;
    contentdiv.style.height=screen.height;
    contentdiv.style.width=screen.width;
    document.body.append(contentdiv);

  
  }

