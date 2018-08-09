function startLoading(){
    $('#loading-screen').show();
    $('#loading-bar-1').css("width","100%");
    setTimeout(()=>{
        $('#loading-bar-2').css("width","100%")
    },500);
    setTimeout(()=>{
        $('#loading-bar-3').css("width","100%")
    },1000);
}

function finishLoading(){
    $('#loading-bar-1').css("width","0")
    setTimeout(()=>{
        $('#loading-bar-2').css("width","0")
    },500);
    setTimeout(()=>{
        $('#loading-bar-3').css("width","0")
    },1000);
    setTimeout(()=>{
        $('#loading-screen').hide()

    },1500);
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj))
}

function startSearch(time){
    setInterval(function(){
        time++
        let minutes = Math.floor(time/60)
        let seconds = time - minutes*60
        if (seconds<10){
            seconds = "0"+seconds
        }
        $('#play-match').html("Searching for match... ("+minutes+":"+seconds+")")

    },1000)
}

function createHeader(){
    $('body').prepend('<div id="header"><a href="/">Home</a><a href="/manage">Manage Models</a><a href="/unpack">Unpack Deliveries</a><a href="/social">Social</a><a id="logout" href="/logout">Logout</a></div><div id="play-cont"><div id="play-match">Play Match</div></div>')
    $('#play-match').on('click',function(){
        socket.emit("play")
        $('#play-match').html("Searching for match... (0:00)")
        startSearch(0)
    })
}
