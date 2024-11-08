export default class Maze {
    constructor(width, height, algorithm, speed, ctx,timer) {
        let canvasWidth = document.getElementById('mazeCanvas').width;
        let windowWidth = window.innerWidth;
        if (windowWidth < 600) {
            canvasWidth = 300;
        }else {
            canvasWidth = 600;
        }
        console.log(canvasWidth);
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.cellSize = canvasWidth / Math.max(width, height); // Taille de chaque cellule du labyrinthe
        this.grid = [];
        this.interval = null;
        this.start = { x: 0, y: 0 };
        this.end = { x: width - 1, y: height - 1 };
        this.startTime = null; // Variable pour stocker l'heure de début
        this.generateGridLive(algorithm, speed);
        this.timer = timer;
    }

    generateGridLive(algorithm, speed) {
        // Inverser la vitesse
        speed = 100 - speed;
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.clearMaze();
        this.startTime = Date.now(); // Stocker l'heure de début
        switch (algorithm) {
            case 'dfs':
                return this.generateDFS(speed);
            case 'prim':
                return this.generatePrim(speed);
            case 'kruskal':
                return this.generateAStar(speed);
            default:
                return this.generateDFS(speed);
        }
    }

    generateBFS(speed) {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                grid[i][j] = { x: j, y: i, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
            }
        }
        let queue = [];
        let current = grid[0][0];
        current.visited = true;
        queue.push(current);
        this.interval = setInterval(() => {
            let neighbors = this.getUnvisitedNeighbors(grid, current);
            if (neighbors.length > 0) {
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWall(current, next);
                next.visited = true;
                queue.push(next);
            }
            if (queue.length > 0) {
                current = queue.shift();
            } else {
                clearInterval(this.interval);
            }
            this.drawGrid(grid);
        }, speed);
    }

    generateAStar(speed) {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                grid[i][j] = { x: j, y: i, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
            }
        }
        let set = new DisjointSet(this.width * this.height);
        let walls = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (i > 0) walls.push({ x1: j, y1: i, x2: j, y2: i - 1 });
                if (j < this.width - 1) walls.push({ x1: j, y1: i, x2: j + 1, y2: i });
            }
        }
        this.shuffle(walls);
        let current = grid[0][0];
        current.visited = true;
        this.interval = setInterval(() => {
            let next = walls.pop();
            if (next) {
                let x1 = next.x1;
                let y1 = next.y1;
                let x2 = next.x2;
                let y2 = next.y2;
                let a = y1 * this.width + x1;
                let b = y2 * this.width + x2;
                if (set.find(a) !== set.find(b)) {
                    set.union(a, b);
                    this.removeWall(grid[y1][x1], grid[y2][x2]);
                }
            } else {
                clearInterval(this.interval);
            }
            this.drawGrid(grid);
        }, speed);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    clearMaze() {
        this.ctx.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
    }

    // Algorithme de recherche en profondeur (DFS)
    // Fonctionne en utilisant une pile pour explorer les cellules voisines non visitées
    generateDFS(speed) {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                grid[i][j] = { x: j, y: i, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
            }
        }
        let stack = [];
        let current = grid[0][0];
        current.visited = true;
        stack.push(current);
        this.interval = setInterval(() => {
            let neighbors = this.getUnvisitedNeighbors(grid, current);
            if (neighbors.length > 0) {
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.removeWall(current, next);
                next.visited = true;
                stack.push(next);
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            } else {
                clearInterval(this.interval);
                this.displayGenerationTime(); // Afficher le temps total de génération
            }
            this.drawGrid(grid); // Dessiner le labyrinthe à chaque étape
            this.drawCurrentCell(current); // Dessiner la cellule actuelle
        }, speed);
    }

    // Algorithme de Prim
    // Fonctionne en utilisant une liste de murs pour connecter des cellules non visitées
    generatePrim(speed) {
        let grid = [];
        for (let i = 0; i < this.height; i++) {
            grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                grid[i][j] = { x: j, y: i, walls: { top: true, right: true, bottom: true, left: true }, visited: false };
            }
        }

        let walls = [];
        let start = grid[0][0];
        start.visited = true;

        // Ajouter les murs de la cellule de départ à la liste des murs
        if (start.y > 0) walls.push({ x1: start.x, y1: start.y, x2: start.x, y2: start.y - 1 });
        if (start.x < this.width - 1) walls.push({ x1: start.x, y1: start.y, x2: start.x + 1, y2: start.y });
        if (start.y < this.height - 1) walls.push({ x1: start.x, y1: start.y, x2: start.x, y2: start.y + 1 });
        if (start.x > 0) walls.push({ x1: start.x, y1: start.y, x2: start.x - 1, y2: start.y });

        let currentCells = [start];

        this.interval = setInterval(() => {
            if (walls.length > 0) {
                let randomIndex = Math.floor(Math.random() * walls.length);
                let wall = walls.splice(randomIndex, 1)[0];

                let x1 = wall.x1;
                let y1 = wall.y1;
                let x2 = wall.x2;
                let y2 = wall.y2;

                let cell1 = grid[y1][x1];
                let cell2 = grid[y2][x2];

                if (cell1.visited !== cell2.visited) {
                    this.removeWall(cell1, cell2);

                    if (!cell2.visited) {
                        cell2.visited = true;
                        currentCells.push(cell2);
                        if (y2 > 0 && !grid[y2 - 1][x2].visited) walls.push({ x1: x2, y1: y2, x2: x2, y2: y2 - 1 });
                        if (x2 < this.width - 1 && !grid[y2][x2 + 1].visited) walls.push({ x1: x2, y1: y2, x2: x2 + 1, y2: y2 });
                        if (y2 < this.height - 1 && !grid[y2 + 1][x2].visited) walls.push({ x1: x2, y1: y2, x2: x2, y2: y2 + 1 });
                        if (x2 > 0 && !grid[y2][x2 - 1].visited) walls.push({ x1: x2, y1: y2, x2: x2 - 1, y2: y2 });
                    }
                }

                // Supprimer les cellules complètement générées de currentCells
                currentCells = currentCells.filter(cell => !this.isCellFullyGenerated(cell));

                this.drawGrid(grid, currentCells); // Dessiner le labyrinthe et les cellules actuelles
            } else {
                clearInterval(this.interval);
                this.displayGenerationTime(); // Afficher le temps total de génération
            }
        }, speed);
    }


    parseTime(time) {
        let seconds = time / 1000;
        let minutes = Math.floor(seconds / 60);
        let miliseconds = Math.floor((seconds % 1) * 1000);
        seconds = Math.floor(seconds % 60);
        let returnString = ''
        if (minutes > 0) {
            returnString += `${minutes} minutes et `;
        }
        if (seconds > 0) {
            returnString += `${seconds} secondes et `;
        }
        returnString += `${miliseconds} milisecondes`;



        return returnString;

    }

    // Afficher le temps total de génération
    displayGenerationTime() {
        const endTime = Date.now();
        const totalTime = (endTime - this.startTime) / 1000; // Temps en secondes
        console.log(`Maze generated in ${totalTime} seconds`);
        this.timer.innerHTML = `Maze generated in ${this.parseTime( (endTime - this.startTime))}`;
    }

    drawGrid(grid, currentCells = []) {
        this.ctx.clearRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.drawCell(grid[i][j]);
            }
        }
        currentCells.forEach(cell => this.drawCurrentCell(cell)); // Dessiner les cellules actuelles
    }

    drawCell(cell) {
        let x = cell.x * this.cellSize;
        let y = cell.y * this.cellSize;
        this.ctx.strokeStyle = 'green'; // Définir la couleur des murs à vert
        this.ctx.lineWidth = 2;

        if (cell.walls.top) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + this.cellSize, y);
            this.ctx.stroke();
        }
        if (cell.walls.right) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.cellSize, y);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
            this.ctx.stroke();
        }
        if (cell.walls.bottom) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
            this.ctx.lineTo(x, y + this.cellSize);
            this.ctx.stroke();
        }
        if (cell.walls.left) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }

    drawCurrentCell(cell) {
        let x = cell.x * this.cellSize;
        let y = cell.y * this.cellSize;
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(x + this.cellSize / 4, y + this.cellSize / 4, this.cellSize / 2, this.cellSize / 2);
    }

    getUnvisitedNeighbors(grid, cell) {
        let neighbors = [];
        let { x, y } = cell;
        if (y > 0 && grid[y - 1] && grid[y - 1][x] && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
        if (x < grid[0].length - 1 && grid[y][x + 1] && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
        if (y < grid.length - 1 && grid[y + 1] && grid[y + 1][x] && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
        if (x > 0 && grid[y][x - 1] && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);
        return neighbors;
    }

    removeWall(current, next) {
        let x = current.x - next.x;
        let y = current.y - next.y;
        if (x === 1) {
            current.walls.left = false;
            next.walls.right = false;
        } else if (x === -1) {
            current.walls.right = false;
            next.walls.left = false;
        }
        if (y === 1) {
            current.walls.top = false;
            next.walls.bottom = false;
        } else if (y === -1) {
            current.walls.bottom = false;
            next.walls.top = false;
        }
    }

    stopGeneration() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    isCellFullyGenerated(cell) {
        return cell.visited && !this.getUnvisitedNeighbors(this.grid, cell).length;
    }
}

class DisjointSet {
    constructor(size) {
        this.set = new Array(size).fill(-1);
    }

    find(x) {
        if (this.set[x] < 0) return x;
        this.set[x] = this.find(this.set[x]);
        return this.set[x];
    }

    union(x, y) {
        x = this.find(x);
        y = this.find(y);
        if (x === y) return;
        if (this.set[x] < this.set[y]) {
            this.set[x] += this.set[y];
            this.set[y] = x;
        } else {
            this.set[y] += this.set[x];
            this.set[x] = y;
        }
    }
}