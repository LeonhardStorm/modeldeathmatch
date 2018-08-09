const socket = io("/match-"+matchid)

socket.on("connect",function(){
    socket.emit("login",user,concode,matchid)
    socket.on("start match",(gamedata)=>{
        console.log(gamedata)
    })
})