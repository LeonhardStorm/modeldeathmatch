const express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	fs = require('fs'),
	spawn = require('child_process'),
	session = require('express-session'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    { Writable } = require('stream'),
	RedisStore = require('connect-redis')(session);
	mainnsp = io.of("/main");

const port = 3000,
	dbName = "local",
	url = 'mongodb://localhost:27017';
let connectcodes = {}

const basicitems = ["0:0","0:1"]

const outStream = new Writable({
  write(chunk, encoding, callback) {
		let input=chunk.toString()
		try{
			console.log(eval(input))
		}
		catch (err){
			console.error(err)
		}
    callback();
  }
});

process.stdin.pipe(outStream);

let accountdb,miscdb;
let amntusers = 0;

async function getAmntUsers(){
    amntusers = await miscdb.findOne({})
	amntusers = amntusers.amntusers
	console.log(amntusers)
}

MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    accountdb = client.db(dbName).collection('accounts')
    miscdb = client.db(dbName).collection('misc')
	getAmntUsers()
});



async function userLogin(user,pass){
	//to do: encryption
	let data = await accountdb.findOne({user,pass})
	if (!data){
		return -1
	}
	return data.id
}

async function userRegister(user,pass){
	//to do: encryption
	let us = await accountdb.find({user}).toArray()
	if (us.length>0){
		return -1
	}
    amntusers++
    let id = amntusers
    miscdb.updateOne({id:'stats'},{$set:{amntusers}})
	await accountdb.insertOne({user,pass,id,inventory:basicitems,models:{},slots:3,social:{friends:[],messages:[],friendrequests:[]}})
	return id
}

function valdiateUser(user,concode){
	return (connectcodes[user]&&connectcodes[user]===concode)
}

function garbageCreator(length=16){
	const alph =  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let output = ""
	for (let i = 0;i<length;i++){
		output += alph[Math.floor(Math.random()*alph.length)]
	}
	return output
}


//middleware
app.use(session({
    store: new RedisStore({
        host:'127.0.0.1',
        port:6379,
        prefix:'session'
    }),
	secret: 'sgjagdoisagig',
	cookie: {expires:9999999}
}))
app.use(express.json());
app.use(express.urlencoded());
app.use("/local", express.static("local"));
app.use("/css", express.static("stylesheets"));
app.use("/js", express.static("js"));


app.get("/",function(req,res){
	if (req.session.user){
		res.sendFile(__dirname + '/html/home.html');
	}else{
		res.sendFile(__dirname + '/html/login.html');
	}
});

app.get("/manage",function(req,res){
    if (req.session.user){
        res.sendFile(__dirname + '/html/manage.html');
    }else{
        res.redirect("/")
    }
})


app.get("/unpack",function(req,res){
    if (req.session.user){
        res.sendFile(__dirname + '/html/unpack.html');
    }else{
        res.redirect("/")
    }
})



app.get("/match",function(req,res){
    if (req.session.user&&playersInMatches[req.session.user]!==undefined){
    	res.sendFile(__dirname + '/html/match.html')
    }else{
        res.redirect("/")
    }
})

app.get("/register",function(req,res){
    if (req.session.user){
        res.redirect("/")
    }else{
        res.sendFile(__dirname + '/html/register.html');
    }
})

app.get("/logout",function(req,res){
	req.session.user=0
	res.redirect("/")
})

app.post("/login-post",async function(req,res){
	const user=req.body.user,
		pass=req.body.pass;
	let userid = await userLogin(user,pass)
	if (userid!==-1){
		req.session.user = userid
		res.send("success")
	}else{
		res.send("fail")
	}
})

app.post("/register-post",async function(req,res){
    const user=req.body.user,
        pass=req.body.pass;
    let userid = await userRegister(user,pass)
   	if (userid!==-1){
        req.session.user = userid
		res.send("success")
    }else{
   		res.send("fail")
	}
})

app.get("/user.js",(req,res)=>{
	if (req.session.user){
		let concode = garbageCreator()
		connectcodes[req.session.user]=concode
		res.send('const user = '+req.session.user+', concode = "'+concode+'";')
	}else{
		res.send('const user = -1')
	}
})

app.get("/matchdata.js",(req,res)=>{
    if (req.session.user){
        let concode = garbageCreator()
        connectcodes[req.session.user]=concode
		let match = playersInMatches[req.session.user]
        res.send('const user = '+req.session.user+', concode = "'+concode+'", matchid = "'+match+'";')
    }else{
        res.send('throw "error"')
    }
})

/*


fs.readdir("data/worlds",function(err,res){
	if (err){
		throw err
	}
	if (res.length>0){
		for (let i of res){
			fs.readFile("data/worlds/"+i,"utf8",function(err,res){
				if (err){
					throw err
				}
				worlds[i.slice(0,i.length-5)] = JSON.parse(res)
			})
		}
	}
})

fs.readFile("data/misc.json","utf8",(err,res)=>{
	if (err)
		throw err;
	misc = JSON.parse(res)
})

*/

function sendToUsers(array,event,content){
	for (let i = 0;i<array.length;i++){
		if (sockets[array[i]]){
			sockets[array[i]].emit(event,content)
		}
	}
}
let sessionamnt = 0
let gameSessions = {}
let playersInMatches = {}

//users is userid. can be array or int
async function getModels(users){
	//get models from db
    let models = {}

    if (typeof users === "object"){
        for (let i = 0;i< users.length;i++){
            models[users[i]] = await accountdb.findOne({id:users[i]}).models
        }
	}else{
		models = await accountdb.findOne({id:users}).models

	}
	return models

}

async function getInventory(userid){
	let account = await accountdb.findOne({id:userid})
	return account.inventory
}

async function saveModel(id,modelobj,slot){
    console.log(id,modelobj,slot)
	let acc = await accountdb.findOne({id})
	if (slot>=acc.slots)
		return;
	let setobj = {}
	setobj.models = {}
	setobj.models[slot] = modelobj
	accountdb.updateOne({id},{$set:setobj})
}

function MatchConstructor(users,id){
	const ions = io.of("match-"+id)
	let connectedsockets = {}
	let amntcon = 0
	this.users = users
	this.modelfiles = getModels(users)
	ions.on("connect",(socket)=>{
		let userid = -1

		const onevent = socket.onevent;
		socket.onevent = function (packet) {
			let args = packet.data || [];
			onevent.call (this, packet);    // original call
			packet.data = ["*"].concat(args);
			onevent.call(this, packet);      // additional call to catch-all
		};

		socket.on("*",(event,data)=>{
			if (event!=="login"&&userid===-1){
				socket.disconnect()
			}
		})

		socket.on("login",function(user,concode,matchid){
			if (playersInMatches[user]!==matchid){
				socket.disconnect()
				return;
			}
			if (valdiateUser(user,concode)){
				userid = user
				amntcon++
				connectedsockets[user]=sockcreateet
				socket.emit("gamedata",{
					amntplayers: users.length,
					models:gameSessions[id].modelfiles,

				})
				if (amntcon===users.length){
					console.log("all users connected")
					gameSessions[id].startMatch()
				}
			}else{
				socket.disconnect()
			}
		})
	})
	this.startMatch = function(){
		this.sendUsers("start match",{amntplayers: users.length,})
	}
	this.sendUsers = function(event,content){
		sendToUsers(users,event,content)
	}
}

function startMatch(users){
	console.log("starting match with",users)
	let id = sessionamnt++
    for (let i = 0;i < users.length; i++){
        playersInMatches[users[i]] = id
    }
	gameSessions[id]=new MatchConstructor(users,id)
	sendToUsers(users,"connect to match")
}

function MatchSearcher(maxUsers,minUsers,secsTillForce){
	let users = []
	let timer;
	this.clearTimer = function(){
		if (timer){
			clearTimeout(timer)
		}
	}
	this.autoStart = function(){
		this.clearTimer()
		timer = setTimeout(()=>{
			if (users.length>=minUsers){
				this.startMatch()
			}
			},secsTillForce*1000)
	}
	this.startMatch = function(){
		this.clearTimer()
		startMatch(users.slice(0))
		users = []
	}
	this.addUser = function(userid){
		console.log("user",userid,"added")
		users.push(userid)
		if (users.length>maxUsers){
			this.startMatch()
		}else{
			this.autoStart()
		}

	}
}

let matchSearcher = new MatchSearcher(12,2,10)
let sockets = {}


//socket io
mainnsp.on("connect",(socket)=>{
	let userid = -1
	socket.on("login",(user,concode)=>{
		if (valdiateUser(user,concode)){
			userid = user
			sockets[userid]=socket
			socket.emit("login success")
		}else{
			socket.emit("login error")
		}
	})
	socket.on("play",()=>{
        if (userid===-1)
            return;
		matchSearcher.addUser(userid)
	})
	socket.on("save model",async (slot,char)=>{
		if (userid===-1)
			return;
		saveModel(userid,char,slot)

	})
	socket.on("get data",async ()=>{
        if (userid===-1)
            return;
        let acc = await accountdb.findOne({id:userid})
        let slots = acc.slots

        let models = acc.models
		let inv = acc.inventory
		socket.emit("get data",models,inv,slots)
	})
})


http.listen(port, function() {
	console.log('MDM running on *:'+port);
});