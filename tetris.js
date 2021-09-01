let canvas;
let context;
// Number of cells in array height
let gamBoardArrayHeight = 20; 
// Number of cells in array width
let gamBoardArrayWidth = 12; 
// X starting position for Tetromino
let startX = 4; 
// Y starting position for Tetromino
let startY = 0; 
// Tracks the score
let score = 0; 
// Tracks current level
let level = 1; 
let winOrLose = "Playing";

let coordinateArray = [...Array(gamBoardArrayHeight)].map(e => Array(gamBoardArrayWidth).fill(0));

let currentTetrimino = [[1,0], [0,1], [1,1], [2,1]];

// Will hold all the Tetrominos 
let tetrominos = [];
// The tetromino array with the colors matched to the tetrominos array
let tetrominoColors = ['pink','blue', 'purple', 'black','orange','green','red'];
// Holds current Tetromino color
let currentTetriminoColor;

// Create gameboard array so we know where other squares are
let gameBoardArray = [...Array(20)].map(e => Array(12).fill(0));

// Array for storing stopped shapes
let stoppedShapeArray = [...Array(20)].map(e => Array(12).fill(0));

/* Created to track the direction I'm moving the Tetromino
   so that I can stop trying to move through walls*/
let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
let direction;

class Coordinates{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

// Execute SetupCanvas when page loads
document.addEventListener('DOMContentLoaded', SetupCanvas); 

// Creates the array with square coordinates [Lookup Table]
function CreateCoordArray(){
    let xR = 0, yR = 19;
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23){
        // 12 * 23 = 276 - 12 = 264 Max X value
        for(let x = 11; x <= 264; x += 23){
            coordinateArray[i][j] = new Coordinates(x,y);
            // console.log(i + ":" + j + " = " + coordinateArray[i][j].x + ":" + coordinateArray[i][j].y);
            i++;
        }
        j++;
        i = 0;
    }
}

function SetupCanvas(){
    canvas = document.getElementById('my-canvas');
    context = canvas.getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    // Double the size of elements to fit the screen
    context.scale(2, 2);

    // Draw Canvas background
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw gameboard rectangle
    context.strokeStyle = 'white';
    context.strokeRect(8, 8, 280, 462);

    tetrisLogo = new Image(161, 54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = "tetrislogo.png";

    // Set font for score label text and draw
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.fillText("SCORE", 300, 98);

    // Draw score rectangle
    context.strokeRect(300, 107, 161, 24);

    // Draw score
    context.fillText(score.toString(), 310, 127);
    
    // Draw level label text
    context.fillText("LEVEL", 300, 157);

    // Draw level rectangle
    context.strokeRect(300, 171, 161, 24);

    // Draw level
    context.fillText(level.toString(), 310, 190);

    // Draw next label text
    context.fillText("WIN / LOSE", 300, 221);

    // Draw playing condition
    context.fillText(winOrLose, 310, 261);

    // Draw playing condition rectangle
    context.strokeRect(300, 232, 161, 95);
    
    // Draw controls label text
    context.fillText("CONTROLS", 300, 354);

    // Draw controls rectangle
    context.strokeRect(300, 366, 161, 104);

    // Draw controls text
    context.font = '19px Arial';
    context.fillText("A : Move Left", 310, 388);
    context.fillText("D : Move Right", 310, 413);
    context.fillText("S : Move Down", 310, 438);
    context.fillText("E : Rotate", 310, 463);

    // Handle keyboard presses
    document.addEventListener('keydown', HandleKeyPress);

    // Create the array of Tetromino arrays
    CreateTetrominos();
    // Generate random Tetromino
    CreateTetromino();

    // Create the rectangle lookup table
    CreateCoordArray();

    DrawTetromino();
}

function DrawTetrisLogo(){
    context.drawImage(tetrisLogo, 300, 8, 161, 54);
}

function DrawTetromino(){
  
    for(let i = 0; i < currentTetrimino.length; i++){

     
        let x = currentTetrimino[i][0] + startX;
        let y = currentTetrimino[i][1] + startY;

       
        gameBoardArray[x][y] = 1;
        

        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;

        context.fillStyle = currentTetriminoColor;
        context.fillRect(coorX, coorY, 21, 21);
    }
}

/* Move & Delete Old Tetrimino 
   Each time a key is pressed we change either the starting
   x or y value for where we want to draw the new Tetromino
   We also delete the previously drawn shape and draw the new one*/
function HandleKeyPress(key){
    if(winOrLose != "Game Over"){
    if(key.keyCode === 65){
        direction = DIRECTION.LEFT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()){
            DeleteTetromino();
            startX--;
            DrawTetromino();
        } 

    } else if(key.keyCode === 68){
        direction = DIRECTION.RIGHT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()){
            DeleteTetromino();
            startX++;
            DrawTetromino();
        }

    // keycode (DOWN)
    } else if(key.keyCode === 83){
        MoveTetrominoDown();
    // keycode (ROTATE)
    } else if(key.keyCode === 69){
        RotateTetromino();
    }
    } 
}

function MoveTetrominoDown(){
    //Track for down movement
    direction = DIRECTION.DOWN;

    //Check for a vertical collision
    if(!CheckForVerticalCollison()){
        DeleteTetromino();
        startY++;
        DrawTetromino();
    }
}

// Automatically calls for a Tetromino to fall every second
window.setInterval(function(){
    if(winOrLose != "Game Over"){
        MoveTetrominoDown();
    }
  }, 1000);


/* Clears the previously drawn Tetromino
   Do the same stuff when we drew originally
   but make the square black this time.*/
function DeleteTetromino(){
    for(let i = 0; i < currentTetrimino.length; i++){
        let x = currentTetrimino[i][0] + startX;
        let y = currentTetrimino[i][1] + startY;

        //Delete Tetromino square from the gameboard array
        gameBoardArray[x][y] = 0;

        // Draw black where colored squares used to be
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        context.fillStyle = 'black';
        context.fillRect(coorX, coorY, 21, 21);
    }
}

// Generate random Tetrominos with color
function CreateTetrominos(){
    // Push T 
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // Push I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // Push J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // Push Square
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // Push L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // Push S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // Push Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
}

function CreateTetromino(){
    // Get a random tetromino index
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    // Set the one to draw
    currentTetrimino = tetrominos[randomTetromino];
    // Get the color for it
    currentTetriminoColor = tetrominoColors[randomTetromino];
}

/* if the Tetromino hits the wall
   Cycle through the squares adding the upper left hand corner
   position to see if the value is <= to 0 or >= 11
   If they are also moving in a direction that would be off
   the board stop movement */
function HittingTheWall(){
    for(let i = 0; i < currentTetrimino.length; i++){
        let newX = currentTetrimino[i][0] + startX;
        if(newX <= 0 && direction === DIRECTION.LEFT){
            return true;
        } else if(newX >= 11 && direction === DIRECTION.RIGHT){
            return true;
        }  
    }
    return false;
}

function CheckForVerticalCollison(){
    let tetrominoCopy = currentTetrimino;
    let collision = false;

    // Cycle through all Tetromino squares
    for(let i = 0; i < tetrominoCopy.length; i++){
        // Get each square of the Tetromino and adjust the square
        // position so I can check for collisions
        let square = tetrominoCopy[i];
        // Move into position based on the changing upper left
        // hand corner of the entire Tetromino shape
        let x = square[0] + startX;
        let y = square[1] + startY;

        // If I'm moving down increment y to check for a collison
        if(direction === DIRECTION.DOWN){
            y++;
        }

        // Check if I'm going to hit a previously set piece
        if(typeof stoppedShapeArray[x][y+1] === 'string'){
            // console.log("COLLISON x : " + x + " y : " + y);
            // If so delete Tetromino
            DeleteTetromino();
            // Increment to put into place and draw
            startY++;
            DrawTetromino();
            collision = true;
            break;
        }
        if(y >= 20){
            collision = true;
            break;
        }
    }
    if(collision){
        // Check for game over and if so set game over text
        if(startY <= 2){
            winOrLose = "Game Over";
            context.fillStyle = 'black';
            context.fillRect(310, 242, 140, 30);
            context.fillStyle = 'white';
            context.fillText(winOrLose, 310, 261);
        } else {

            // Add stopped Tetromino to stopped shape array
            // so I can check for future collisions
            for(let i = 0; i < tetrominoCopy.length; i++){
                let square = tetrominoCopy[i];
                let x = square[0] + startX;
                let y = square[1] + startY;
                // Add the current Tetromino color
                stoppedShapeArray[x][y] = currentTetriminoColor;
            }

            // Check for completed rows
            CheckForCompletedRows();

            CreateTetromino();

            // Create the next Tetromino and draw it and reset direction
            direction = DIRECTION.IDLE;
            startX = 4;
            startY = 0;
            DrawTetromino();
        }

    }
}

// Check for horizontal shape collision
function CheckForHorizontalCollision(){
    var tetrominoCopy = currentTetrimino;
    var collision = false;

    // Cycle through all Tetromino squares
    for(var i = 0; i < tetrominoCopy.length; i++)
    {
        // Get the square and move it into position using
        // the upper left hand coordinates
        var square = tetrominoCopy[i];
        var x = square[0] + startX;
        var y = square[1] + startY;

        // Move Tetromino clone square into position based
        // on direction moving
        if (direction == DIRECTION.LEFT){
            x--;
        }else if (direction == DIRECTION.RIGHT){
            x++;
        }

        // Get the potential stopped square that may exist
        var stoppedShapeVal = stoppedShapeArray[x][y];

        // If it is a string we know a stopped square is there
        if (typeof stoppedShapeVal === 'string')
        {
            collision=true;
            break;
        }
    }

    return collision;
}

// Check for completed rows
// ***** SLIDE *****
function CheckForCompletedRows(){

    // Track how many rows to delete and where to start deleting
    let rowsToDelete = 0;
    let startOfDeletion = 0;

    // Check every row to see if it has been completed
    for (let y = 0; y < gamBoardArrayHeight; y++)
    {
        let completed = true;
        for(let x = 0; x < gamBoardArrayWidth; x++)
        {
            let square = stoppedShapeArray[x][y];
            if (square === 0 || (typeof square === 'undefined'))
            {
                completed=false;
                break;
            }
        }

        // If a row has been completed
        if (completed)
        {
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;

        
            for(let i = 0; i < gamBoardArrayWidth; i++)
            {
                // Update the arrays by deleting previous squares
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y] = 0;
                // Look for the x & y values in the lookup table
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                // Draw the square as black
                context.fillStyle = 'black';
                context.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    if(rowsToDelete > 0){
        score += 10;
        context.fillStyle = 'black';
        context.fillRect(310, 109, 140, 19);
        context.fillStyle = 'white';
        context.fillText(score.toString(), 310, 127);
        MoveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}

// Move rows down after a row has been deleted
function MoveAllRowsDown(rowsToDelete, startOfDeletion){
    for (var i = startOfDeletion-1; i >= 0; i--)
    {
        for(var x = 0; x < gamBoardArrayWidth; x++)
        {
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];

            if (typeof square === 'string')
            {
                nextSquare = square;
                gameBoardArray[x][y2] = 1; 
                stoppedShapeArray[x][y2] = square; 

                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                context.fillStyle = nextSquare;
                context.fillRect(coorX, coorY, 21, 21);

                square = 0;
                gameBoardArray[x][i] = 0; 
                stoppedShapeArray[x][i] = 0; 
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                context.fillStyle = 'black';
                context.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

// Rotate the Tetromino
function RotateTetromino()
{
    let newRotation = new Array();
    let tetrominoCopy = currentTetrimino;
    let currentTetriminoBU;

    for(let i = 0; i < tetrominoCopy.length; i++)
    {
        currentTetriminoBU = [...currentTetrimino];

        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    DeleteTetromino();

    // Try to draw the new Tetromino rotation
    try{
        currentTetrimino = newRotation;
        DrawTetromino();
    }  
    // If there is an error get the backup Tetromino and
    // draw it instead
    catch (e){ 
        if(e instanceof TypeError) {
            currentTetrimino = currentTetriminoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

function GetLastSquareX()
{
    let lastX = 0;
     for(let i = 0; i < currentTetrimino.length; i++)
    {
        let square = currentTetrimino[i];
        if (square[0] > lastX)
            lastX = square[0];
    }
    return lastX;
}
