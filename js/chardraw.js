

function drawBase(base,color,ctx){
    ctx.clearRect(0, 0, 250, 450);
    drawThing(ctx,"/local/pictures/bases/mask-"+base+".png","/local/pictures/bases/base-"+base+".png",color,function(){
        $('#char-output').attr("src",canvas.toDataURL());
    });
}




function drawThing(ctx,mask,outline,bg,cb){
    let img = new Image()
    let img2 = new Image()
    let img3 = new Image()

    img.src = mask

    $(img).one("load",function(){
        ctx.drawImage(img,0,0);
        let imgd = ctx.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight),
            pix = imgd.data;
        if (typeof bg==="string"){
            img3.src = "/local/pictures/patterns/"+bg+".png"
            $(img3).on("load",function() {
                let ctx2 = document.getElementById("pattern-canvas").getContext("2d");
                ctx2.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
                ctx2.drawImage(img3, 0, 0)
                let imgd2 = ctx2.getImageData(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight).data
                for (let i = 0, n = pix.length; i <n; i += 4) {
                    pix[i] = imgd2[i];
                    pix[i+1] = imgd2[i+1];
                    pix[i+2] = imgd2[i+2];
                }
                ctx.putImageData(imgd, 0, 0);
                img2.src = outline

            })
        }else{
            let color = bg;
            for (let i = 0, n = pix.length; i <n; i += 4) {
                pix[i] = color[0];
                pix[i+1] = color[1];
                pix[i+2] = color[2];
            }
            ctx.putImageData(imgd, 0, 0);
            img2.src = outline
        }

    });
    $(img2).one("load",function(){
        ctx.drawImage(img2,0,0)
        cb()
    })
}


function drawPiece(base, clothes, filling, ctx, cb){
    drawThing(ctx,"/local/pictures/clothes/"+clothes+"/mask-"+base+".png","/local/pictures/clothes/"+clothes+"/"+base+".png",filling,cb)
}

function drawPieceRec(clothesarr,counter,cb){
    if (counter===6){
        cb()
        return;
    }
    if (clothesarr[counter].length > 0 && clothesarr[counter].split(":").length === 2) {
        drawPiece(base, items[clothesarr[counter].split(":")[0]][1], fillings[clothesarr[counter].split(":")[1]],function(){
            drawPieceRec(clothesarr,counter+1,cb)
        })
    }else{
        drawPieceRec(clothesarr,counter+1,cb)
    }
}

function drawErrorChar(ctx){
    let img = document.getElementById("mask-loader")
    $(img).attr("src","/local/pictures/misc/error-dude.png")
    ctx.drawImage(img,0,0)
}

function drawCharacter(charobj,canvas){
    let ctx = canvas.getContext("2d")
    ctx.clearRect(0,0,250,450)
    try {
        let base = charobj.gender + charobj.bodytype
        drawThing(ctx,"/local/pictures/bases/mask-"+base+".png","/local/pictures/bases/base-"+base+".png",skincolors[charobj.skin],function(){
            drawPieceRec(charobj.clothes,0,function(){
                $('#char-output').attr("src",canvas.toDataURL());
            })
        })
    }catch(err){
        drawErrorChar(ctx)
    }
}