import Maze from './maze.js';

let canvas = document.getElementById('mazeCanvas');
let ctx = canvas.getContext('2d');

let maze = null;

function resizeCanvas() {
    let widthWindow = window.innerWidth;
    let heightWindow = window.innerHeight
    if(widthWindow < 600) {
        canvas.width = 300;
        canvas.height = 300;
        if(maze){
            maze.stopGeneration();
        }
    }else{
        canvas.width = 600;
        canvas.height = 600;
        if(maze){
            maze.stopGeneration();
        }
    }
}

resizeCanvas();

window.addEventListener('resize', () => {
    resizeCanvas();
});

document.getElementById('generate').addEventListener('click', () => {
    document.getElementById('timer').innerHTML = '';
    let width = document.getElementById('width').value;
    let height = document.getElementById('height').value;
    let algorithm = document.getElementById('algorithm').value;
    let speed = document.getElementById('speed').value;
    if (maze) {
        maze.stopGeneration();
    }
    new Maze(width, height, algorithm, speed, ctx,document.getElementById('timer'))
});

