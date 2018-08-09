let socket = io("/main")

let chartemp = {
    gender:"m",
    bodytype:2,
    skin:1,
	clothes:{
		0:"",
		1:"",
		2:"",
		3:"",
		4:"",
		5:"",
		6:""
	}
};

let char = clone(chartemp)

let chars = {},
	inventory = []
let canvas,ctx;
let selectedmodel = 0
let slots = 0



function radioOption(variable,val,ctx){
	if (char[variable]===val){
		return
	}
	char[variable]=val
	drawBase(char.gender+char.bodytype,skincolors[char.skin],ctx)
}

function charCreator(){


	$('.gender-check').on("click",function(e){
		radioOption('gender',$(e.currentTarget).attr("value"),ctx)
	});
	$('.bodytype-check').on("click",function(e){
		radioOption('bodytype',$(e.currentTarget).attr("value"),ctx)
	});
	$('.skin-check').on("click",function(e){
		radioOption('skin',$(e.currentTarget).attr("value"),ctx)
	});
}

function drawPage(){
	if (chars[selectedmodel]===undefined){
        $('#char-creator').show()
        $('#inventory').hide()
		char = clone(chartemp)
		drawCharacter(char, canvas)
    }else{
        drawCharacter(chars[selectedmodel],canvas)
		drawInvTab(0)
        $('#inventory').show()
        $('#char-creator').hide()
    }
    $('#selected-model').html(selectedmodel)

}

socket.on("connect",function(){
	socket.emit("login",user,concode)
})

socket.on("login success",function(){
    socket.emit("get data")
})

socket.on("get data",function(models,inv,sl){
	chars = models
	inventory = inv
	slots = sl
	for (let i = slots-1;i >= 0;i--){
		if (chars[i]){
			selectedmodel=i
		}
	}
	drawPage()
})

function saveModel(){
    if (chars[selectedmodel]){
        socket.emit('save model',selectedmodel,chars[selectedmodel])
    }
}

function addInvTab(itemno) {
    let arr = inventory[itemno].split(":")

    let temp = $('<div class="inv-item" item="'+itemno+'"><canvas></canvas><div class="inv-name">'+items[arr[0]].name+'</div></div>').appendTo('#inv-cont')
	drawThing($(temp).find('canvas')[0].getContext("2d"),'/local/pictures/clothes/' + items[arr[0]].fn + '/thumb-mask.png','/local/pictures/clothes/' + items[arr[0]].fn + '/thumb-outline.png',fillings[arr[1]])
}

function drawInvTab(tab){
	tab*=1
	$('#inv-cont').empty()
	for (let i = 0;i < inventory.length;i++){
		let arr = inventory[i].split(":")
		if (items[arr[0]].type===tab){
			addInvTab(i)
		}
	}
}

function main(){
	canvas = document.getElementById('character-canvas')
    ctx = canvas.getContext("2d");

    $('.load-test').on("click",()=>{
		startLoading()
		setTimeout(()=>{
			finishLoading()
		},2000)
	});

	charCreator()

	socket.on("login error",function(){
		alert("ERROR: Connection could not be established.")
	})
	socket.on("critical error",function(err){
		alert("CRITICAL ERROR: "+err)
	})
	socket.on("connect to match",function(){
		window.location.href = "/match"
	})
	createHeader()
	$('.save-model').on('click',function(){
		saveModel()
	})
	$('.create-model').on("click",function(){
		chars[selectedmodel]=char
		drawPage()
		saveModel()
	})
	$('.inv-tab').on("click",function(e){
		$('.inv-tab.selected').removeClass("selected")
		$(e.currentTarget).addClass('selected')
		drawInvTab($(e.currentTarget).attr("tab"))
	})
}

$(document).ready(main);