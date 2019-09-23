/* 
 * 
 * All inputs are a booleans, relative to the
 * current tile as shown below.
 * 
 * true represents a wall, false is a path
 * 
 *    +----+----+----+
 *    | TL | T  | TR |
 *    +----+----+----+
 *    | L  |    | R  |
 *    +----+----+----+
 *    | BL | B  | BR |
 *    +----+----+----+
 *       
 */

//A dictionary of recognised tiles, and where they
//can be found on the real tile map
var gridLookup = {
    '1,5': [4,2],
    '1,7': [3,5],
    '2,10': [6,0],
    '2,11': [4,4],
    '3,5': [0,6],
    '3,7': [6,3],
    '3,10': [5,3],
    '3,11': [2,4],
    '3,15': [4,6],
    '5,2': [4,0],
    '5,3': [3,4],
    '5,7': [4,1],
    '7,2': [4,3],
    '7,3': [2,6],
    '7,7': [6,4],
    '7,10': [5,0],
    '7,11': [3,6],
    '7,15': [0,4],
    '10,1': [6,2],
    '10,3': [2,5],
    '10,11': [6,1],
    '11,1': [1,6],
    '11,3': [6,5],
    '11,5': [5,2],
    '11,7': [5,5],
    '11,11': [5,4],
    '11,15': [1,5],
    '15,3': [4,5],
    '15,7': [0,5],
    '15,11': [1,4],
    '15,15': [5,1]
}

//Input is bool array as below:
// [T,TR,R,BR,B,BL,L,TL]
function wallpicker(input) {

    var x = 0;
    var y = 0;

    //First 4x4 (0-3 x 0-3) will exist
    if (input[0]) {
        y += 1;
    }
    if (input[2]) {
        x += 1;
    }
    if (input[4]) {
        y += 2;
    }
    if (input[6]) {
        x += 2;
    }

    //These tiles must be checked - if they do not exist, it's
    //because they would look the exact same as the tile in the
    //first 4x4 part of the grid
    if (input[1] && (gridLookup[x + ',' + (y + 4)] != undefined)) {
        y += 4;
    }
    if (input[3] && (gridLookup[(x + 4) + ',' + y] != undefined)) {
        x += 4;
    }
    if (input[5] && (gridLookup[x + ',' + (y + 8)] != undefined)) {
        y += 8;
    }
    if (input[7] && (gridLookup[(x + 8) + ',' + y] != undefined)) {
        x += 8;
    }

    //If tile does not exist, revert to the version between 0-3 x 0-3,
    //if the tile does exist, return the redirected location
    if ((gridLookup[x + ',' + y] == undefined)) {
        x = x % 4;
        y = y % 4;
    } else {
        return gridLookup[x + ',' + y]
    }

    return [x,y]

}
