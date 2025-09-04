class Ship {
  constructor(length, direction = "horizontal") {
    this.length = length;
    this.direction = direction;
    this.hits = 0;
    this.sunk = false;
    this.positions = [];
  }

  hit() {
    this.hits++;
    if (this.hits >= this.length) {
      this.sunk = true;
    }
    return this.sunk;
  }

  isSunk() {
    return this.sunk;
  }
}

class GameBoard {
  constructor() {
    this.board = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.ships = [];
    this.attacks = Array(10)
      .fill()
      .map(() => Array(10).fill(false));
  }

  canPlaceShip(ship, x, y) {
    if (ship.direction === "horizontal") {
      if (x + ship.length > 10) return false;
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y][x + i] !== 0) return false;
      }
    } else {
      if (y + ship.length > 10) return false;
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y + i][x] !== 0) return false;
      }
    }
    return true;
  }

  placeShip(ship, x, y) {
    if (!this.canPlaceShip(ship, x, y)) return false;

    ship.positions = [];
    if (ship.direction === "horizontal") {
      for (let i = 0; i < ship.length; i++) {
        this.board[y][x + i] = ship;
        ship.positions.push({ x: x + i, y: y });
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        this.board[y + i][x] = ship;
        ship.positions.push({ x: x, y: y + i });
      }
    }

    this.ships.push(ship);
    return true;
  }

  receiveAttack(x, y) {
    if (this.attacks[y][x]) return "already_hit";

    this.attacks[y][x] = true;
    const target = this.board[y][x];

    if (target === 0) {
      return "miss";
    } else {
      const sunk = target.hit();
      if (this.allShipsSunk()) {
        return "game_over";
      }
      return sunk ? "sunk" : "hit";
    }
  }

  allShipsSunk() {
    return this.ships.every((ship) => ship.sunk);
  }

  clear() {
    this.board = Array(10)
      .fill()
      .map(() => Array(10).fill(0));
    this.ships = [];
    this.attacks = Array(10)
      .fill()
      .map(() => Array(10).fill(false));
  }
}

class Player {
  constructor(name, isHuman = true) {
    this.name = name;
    this.isHuman = isHuman;
    this.gameBoard = new GameBoard();
  }
}

class GameManager {
  constructor() {
    this.player = new Player("Player", true);
    this.computer = new Player("Computer", false);
    this.currentDirection = "horizontal";
    this.gameStarted = false;
    this.gameOver = false;
    this.playerTurn = true;
    this.computerStrategy = {
      lastHit: null,
      targetQueue: [],
    };

    this.initializeCanvas();
    this.initializeDragDrop();
    this.placeComputerShips();
  }

  initializeCanvas() {
    this.playerCanvas = document.getElementById("playerBoard");
    this.opponentCanvas = document.getElementById("opponentBoard");
    this.playerCtx = this.playerCanvas.getContext("2d");
    this.opponentCtx = this.opponentCanvas.getContext("2d");

    this.cellSize = 50;

    // Add click handlers
    this.opponentCanvas.addEventListener("click", (e) =>
      this.handleOpponentClick(e)
    );
    this.playerCanvas.addEventListener("dragover", (e) => e.preventDefault());
    this.playerCanvas.addEventListener("drop", (e) => this.handleDrop(e));

    this.drawBoards();
  }

  initializeDragDrop() {
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => {
      ship.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", ship.dataset.shipId);
      });
    });
  }

  drawBoards() {
    this.drawBoard(this.playerCtx, this.player.gameBoard, true);
    this.drawBoard(this.opponentCtx, this.computer.gameBoard, false);
  }

  drawBoard(ctx, gameBoard, showShips) {
    ctx.clearRect(0, 0, 500, 500);

    // Draw grid
    ctx.strokeStyle = "aliceblue";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * this.cellSize, 0);
      ctx.lineTo(i * this.cellSize, 500);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * this.cellSize);
      ctx.lineTo(500, i * this.cellSize);
      ctx.stroke();
    }

    // Draw ships and attacks
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = gameBoard.board[y][x];
        const attacked = gameBoard.attacks[y][x];

        if (showShips && cell !== 0) {
          // Draw ship
          ctx.fillStyle = cell.sunk ? "#660000" : "red";
          ctx.fillRect(
            x * this.cellSize + 2,
            y * this.cellSize + 2,
            this.cellSize - 4,
            this.cellSize - 4
          );
        }

        if (attacked) {
          if (cell !== 0) {
            // Hit
            ctx.fillStyle = cell.sunk ? "#990000" : "#ff6666";
            ctx.fillRect(
              x * this.cellSize + 5,
              y * this.cellSize + 5,
              this.cellSize - 10,
              this.cellSize - 10
            );

            // Draw X
            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x * this.cellSize + 10, y * this.cellSize + 10);
            ctx.lineTo(x * this.cellSize + 40, y * this.cellSize + 40);
            ctx.moveTo(x * this.cellSize + 40, y * this.cellSize + 10);
            ctx.lineTo(x * this.cellSize + 10, y * this.cellSize + 40);
            ctx.stroke();
          } else {
            // Miss
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(
              x * this.cellSize + 25,
              y * this.cellSize + 25,
              10,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const shipId = e.dataTransfer.getData("text/plain");
    const ship = document.querySelector(`[data-ship-id="${shipId}"]`);

    if (ship.classList.contains("placed")) return;

    const rect = this.playerCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / this.cellSize);
    const y = Math.floor((e.clientY - rect.top) / this.cellSize);

    if (x < 0 || x >= 10 || y < 0 || y >= 10) return;

    const length = parseInt(ship.dataset.length);
    const gameShip = new Ship(length, this.currentDirection);

    if (this.player.gameBoard.placeShip(gameShip, x, y)) {
      ship.classList.add("placed");
      this.drawBoards();
      this.checkAllShipsPlaced();
    }
  }

  checkAllShipsPlaced() {
    const ships = document.querySelectorAll(".ship");
    const allPlaced = Array.from(ships).every((ship) =>
      ship.classList.contains("placed")
    );

    if (allPlaced) {
      this.gameStarted = true;
      document.getElementById("instructions").textContent =
        "All ships placed! Click on the opponent's board to attack!";
    }
  }

  handleOpponentClick(e) {
    if (!this.gameStarted || this.gameOver || !this.playerTurn) return;

    const rect = this.opponentCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / this.cellSize);
    const y = Math.floor((e.clientY - rect.top) / this.cellSize);

    if (x < 0 || x >= 10 || y < 0 || y >= 10) return;

    const result = this.computer.gameBoard.receiveAttack(x, y);

    if (result === "already_hit") {
      document.getElementById("instructions").textContent =
        "Already attacked this position!";
      return;
    }

    this.drawBoards();

    if (result === "game_over") {
      this.gameOver = true;
      document.getElementById("instructions").textContent =
        "You Win! Game Over!";
      return;
    }

    this.playerTurn = false;
    document.getElementById("instructions").textContent =
      result === "miss"
        ? "Miss! Computer's turn..."
        : result === "sunk"
        ? "Hit and Sunk! Computer's turn..."
        : "Hit! Computer's turn...";

    setTimeout(() => this.computerTurn(), 1000);
  }

  computerTurn() {
    if (this.gameOver || this.playerTurn) return;

    let x, y;

    // Smart AI strategy
    if (this.computerStrategy.targetQueue.length > 0) {
      const target = this.computerStrategy.targetQueue.shift();
      x = target.x;
      y = target.y;
    } else if (this.computerStrategy.lastHit) {
      // Try adjacent cells
      const adjacent = this.getAdjacentCells(
        this.computerStrategy.lastHit.x,
        this.computerStrategy.lastHit.y
      );
      const validTargets = adjacent.filter(
        (pos) => !this.player.gameBoard.attacks[pos.y][pos.x]
      );

      if (validTargets.length > 0) {
        const target =
          validTargets[Math.floor(Math.random() * validTargets.length)];
        x = target.x;
        y = target.y;
      } else {
        this.computerStrategy.lastHit = null;
        ({ x, y } = this.getRandomTarget());
      }
    } else {
      ({ x, y } = this.getRandomTarget());
    }

    if (x === -1) {
      this.gameOver = true;
      document.getElementById("instructions").textContent = "Game Over!";
      return;
    }

    const result = this.player.gameBoard.receiveAttack(x, y);

    if (result === "hit" || result === "sunk") {
      if (result === "hit") {
        this.computerStrategy.lastHit = { x, y };
        const adjacent = this.getAdjacentCells(x, y);
        this.computerStrategy.targetQueue.push(
          ...adjacent.filter(
            (pos) => !this.player.gameBoard.attacks[pos.y][pos.x]
          )
        );
      } else {
        this.computerStrategy.lastHit = null;
        this.computerStrategy.targetQueue = [];
      }
    }

    this.drawBoards();

    if (result === "game_over") {
      this.gameOver = true;
      document.getElementById("instructions").textContent =
        "Computer Wins! Game Over!";
      return;
    }

    this.playerTurn = true;
    document.getElementById("instructions").textContent =
      result === "miss"
        ? "Computer missed! Your turn."
        : result === "sunk"
        ? "Computer hit and sunk your ship! Your turn."
        : "Computer hit your ship! Your turn.";
  }

  getAdjacentCells(x, y) {
    const adjacent = [];
    if (x > 0) adjacent.push({ x: x - 1, y });
    if (x < 9) adjacent.push({ x: x + 1, y });
    if (y > 0) adjacent.push({ x, y: y - 1 });
    if (y < 9) adjacent.push({ x, y: y + 1 });
    return adjacent;
  }

  getRandomTarget() {
    const available = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (!this.player.gameBoard.attacks[y][x]) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) return { x: -1, y: -1 };

    const target = available[Math.floor(Math.random() * available.length)];
    return target;
  }

  placeComputerShips() {
    const shipLengths = [5, 4, 3, 2];

    shipLengths.forEach((length) => {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";

        const ship = new Ship(length, direction);
        if (this.computer.gameBoard.placeShip(ship, x, y)) {
          placed = true;
        }
      }
    });
  }

  toggleDirection() {
    this.currentDirection =
      this.currentDirection === "horizontal" ? "vertical" : "horizontal";

    const ships = document.querySelectorAll(".ship:not(.placed)");
    ships.forEach((ship) => {
      ship.classList.toggle("vertical");
      ship.classList.toggle("horizontal");
    });
  }

  randomizeBoard() {
    this.player.gameBoard.clear();
    const shipLengths = [5, 4, 3, 2];

    shipLengths.forEach((length) => {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";

        const ship = new Ship(length, direction);
        if (this.player.gameBoard.placeShip(ship, x, y)) {
          placed = true;
        }
      }
    });

    // Mark all ships as placed
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => ship.classList.add("placed"));

    this.gameStarted = true;
    this.drawBoards();
    document.getElementById("instructions").textContent =
      "Ships randomized! Click on the opponent's board to attack!";
  }

  restartGame() {
    this.player = new Player("Player", true);
    this.computer = new Player("Computer", false);
    this.gameStarted = false;
    this.gameOver = false;
    this.playerTurn = true;
    this.computerStrategy = { lastHit: null, targetQueue: [] };

    // Reset ship UI
    const ships = document.querySelectorAll(".ship");
    ships.forEach((ship) => ship.classList.remove("placed"));

    this.placeComputerShips();
    this.drawBoards();

    document.getElementById("instructions").textContent =
      'Place your ships by dragging them to your board, or click "Randomize Board". Then click on the opponent\'s board to start attacking!';
  }
}

// Initialize the game
const gameManager = new GameManager();
