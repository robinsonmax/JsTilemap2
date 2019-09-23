//Called on load
window.onload = function () {

    //Checks that browser isn't IE
    var ua = window.navigator.userAgent;
    if (ua.indexOf("MSIE ") > 0 || ua.indexOf('Trident/') > 0 || ua.indexOf('Edge/') > 0) {
        console.log("Ahhhh, not IE!")
        alert("This game does not work with Internet Explorer, please use a different browser.")
    } else {
        console.log("Browser OK")

        //Checks that jQuery is loaded/working
        if (window.jQuery) {
            StartUp();
        } else {
            alert("Error Loading jQuery");
        }

    }    
}

//Call resize method when browser is resized
window.onresize = Resize;

//Global Variables
var canvas;                 //Canvas object
var ctx;                    //Context
var rawTileSize = 400;      //The width/height of each tile on the tilemap in px
var tilesPerPage = 14;      //Maximum number of tiles to be displayed in the width/height
var tileSize;               //The size of each tile in px in the window
var spriteSheet;            //The spritesheet img
var player;                 //The player object
var animationLagFrames = 5; //Number of frames the map moves over
var animationLagX = 0;      //Used to delay the movement of the map over a few frames
var animationLagY = 0;
var map = DecodeMap(mapSize[0], mapSize[1], mapInput);  //2D array of locations/grid references of each tile

class Player {

    //Sets the players X/Y position when created
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
    }

    //When called, move the player in the given direction
    //NOTE: The player will only move if the tile they are
    //      moving to is a path.
    Move(direction) {

        switch (direction) {
            case 'left':
                try {
                    //Using "== false" instead of "!", to prevent undrefined walls (edges) from being allowed
                    if (map[this.y][this.x - 1] == false) {
                        animationLagX = 0 - animationLagFrames
                        this.x--;
                    }
                } catch (e) { }
                break;
            case 'right':
                try {
                    if (map[this.y][this.x + 1] == false) {
                        animationLagX = animationLagFrames
                        this.x++;
                    }
                } catch (e) { }
                break;
            case 'up':
                try {
                    if (map[this.y - 1][this.x] == false) {
                        animationLagY = 0 - animationLagFrames
                        this.y--;
                    }
                } catch (e) { }
                break;
            case 'down':
                try {
                    if (map[this.y + 1][this.x] == false) {
                        animationLagY = animationLagFrames
                        this.y++;
                    }
                } catch (e) { }
                break;
        }
    }

    //Returns the X/Y position of the player in pixels
    RealX() {
        return this.x * tileSize * -1;
    }
    RealY() {
        return this.y * tileSize * -1;
    }
}

//Called when page loads
function StartUp() {

    //Create canvas & context
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');

    //Load spritesheet as an image from the html
    spriteSheet = document.getElementById('spritesheet')

    //Call the resize method, to set the tile size, background etc.
    Resize();

    //Create the player
    player = new Player(startPos[0], startPos[1]);

    //When an arrow key is pressed, call the Move method on the player
    //in the corresponding direction
    $(document).keydown(function (e) {
        switch (e.keyCode) {
            case 37:
                player.Move('left')
                break;
            case 38:
                player.Move('up')
                break;
            case 39:
                player.Move('right')
                break;
            case 40:
                player.Move('down')
                break;
        }
    });

    //Start rendering
    Render();

}

//Called when page resized - for re-scaling/re-rendering map
function Resize() {

    //Get canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Set tile size based on the smallest edge of the window
    if (canvas.width < canvas.height) {
        tileSize = canvas.height / tilesPerPage;
    } else {
        tileSize = canvas.width / tilesPerPage;
    }

    //Sets offset for tiles, so that rendering is done from the center of the screen
    offset_x = (canvas.width - tileSize) / 2;
    offset_y = (canvas.height - tileSize) / 2;

    //Set background of canvas to background tile on repeat
    // -> Rendering the background will be more efficient when near the edge of the tilemap
    // -> The background will repeat forever, incase a tile doesn't render
    document.getElementById('game').style.backgroundImage = 'url("' + document.getElementById('backgroundTile').src + '")';
    document.getElementById('game').style.backgroundSize = tileSize + 'px'
    document.getElementById('game').style.backgroundPositionX = offset_x + 'px'
    document.getElementById('game').style.backgroundPositionY = offset_y + 'px'

}

//Decodes the raw string of the map into 2D array of tilemap locations/grid references
function DecodeMap(width, height, rawMap) {
    //Create 2D array of true/false values for if there is a wall from the rawMap
    result = []
    for (var h = 0; h < height; h++) {
        boolRow = []
        for (var w = 0; w < width; w++) {
            tileValue = rawMap.substring((h * width) + w, (h * width) + w + 1);
            if (tileValue == "1") {
                boolRow.push(true)
            } else {
                boolRow.push(false)
            }
        }
        result.push(boolRow)
    }

    return result;
}


//Draws a tile to the canvas
function DrawTile(xPos, yPos, size, tile) {

    
    //Lookup the tile on the spritesheet
    //If tile is background, don't bother rendering it
    if (tile == null) {
        return;
    }

    //Draw the tile from the spritesheet to the canvas
    //NOTE: The "+1"s and "-2"s crop the tile by 1 pixel, as
    //      modern browsers such as chrome use anti aliasing
    //      which cause the image to bleed with neighbouring
    //      tiles on the spritesheet.
    ctx.drawImage(
        img = spriteSheet,
        x = (tile[0] * rawTileSize)+1,
        y = (tile[1] * rawTileSize)+1,
        dw = rawTileSize-2,
        dh = rawTileSize-2,
        sx = xPos + offset_x,
        sy = yPos + offset_y,
        swidth = size,
        sheight = size
    );
}

//Called each frame
function Render() {

    //Clear frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //Draw map
    //NOTE: modern browsers are smart enough not to render tiles that are
    //      not on the canvas, meaning that it would be a waste of time &
    //      code to calculate which tiles don't need displying each frame
    for (var y = 0; y < map.length; y++) {
        for (var x = 0; x < map[0].length; x++) {
            if (map[y][x]) {
                var tile = null
            }
            else {
                var tile = [5, 1]
            }
            DrawTile(player.RealX() + (tileSize * x) + (tileSize * animationLagX / animationLagFrames), player.RealY() + (tileSize * y) + (tileSize * animationLagY / animationLagFrames), tileSize, tile)
        }
    }  

    //Decremends the animation lag values
    //This prevents the tilemap from moving a full tile each frame
    //They will do this over a small number of frames instead
    if (animationLagX > 0) {
        animationLagX--;
    } else if (animationLagX < 0) {
        animationLagX++;
    }
    if (animationLagY > 0) {
        animationLagY--;
    } else if (animationLagY < 0) {
        animationLagY++;
    }

    //Corrects the background lag values
    document.getElementById('game').style.backgroundPositionX = ((animationLagX / animationLagFrames * tileSize) + offset_x) + 'px'
    document.getElementById('game').style.backgroundPositionY = ((animationLagY / animationLagFrames * tileSize) + offset_y) + 'px'

    //Draw Player
    DrawTile(0, 0, tileSize, [6,6])

    //Screen resolution text
    ctx.font = '25px Arial';
    ctx.fillStyle = 'rgba(127,127,127,1)';
    ctx.fillText(canvas.width + ' x ' + canvas.height + ' ' + player.x + ',' + player.y, 20, 50);

    //Render frame
    requestAnimationFrame(Render);

}
