// Define game constants
    const GAME_WIDTH = 360;
    const GAME_HEIGHT = 640;
    const BLOCK_SIZE = 30;
    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 20;
    const COLOR_MAP = {
      'I': 0x00ff00, // Green
      'J': 0x0000ff, // Blue
      'L': 0xff0000, // Red
      'O': 0xffff00, // Yellow
      'S': 0x00ffff, // Cyan
      'T': 0xff00ff, // Magenta
      'Z': 0x800000, // Brown
    };

    // Initialize game application
    const app = new PIXI.Application({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: 0x000000,
    });
    document.body.appendChild(app.view);

    // Define Tetromino class
    class Tetromino {
      constructor(type) {
        this.type = type;
        this.x = Math.floor(GRID_WIDTH / 2);
        this.y = 0;
        this.blocks = [];
        switch (type) {
          case 'I':
            this.blocks = [[-1, 0], [0, 0], [1, 0], [2, 0]];
            break;
          case 'J':
            this.blocks = [[-1, 0], [0, 0], [1, 0], [1, -1]];
            break;
          case 'L':
            this.blocks = [[-1, 0], [0, 0], [1, 0], [-1, -1]];
            break;
          case 'O':
            this.blocks = [[0, 0], [1, 0], [0, -1], [1, -1]];
            break;
          case 'S':
            this.blocks = [[-1, 0], [0, 0], [0, -1], [1, -1]];
            break;
          case 'T':
            this.blocks = [[-1, 0], [0, 0], [1, 0], [0, -1]];
            break;
          case 'Z':
            this.blocks = [[-1, -1], [0, -1], [0, 0], [1, 0]];
            break;
        }
      }

      rotate() {
        const newBlocks = [];
        for (const block of this.blocks) {
          newBlocks.push([block[1], -block[0]]);
        }
        this.blocks = newBlocks;
      }
    }

    // Initialize game state
    let grid = [];
    for (let i = 0; i < GRID_HEIGHT; i++) {
      grid[i] = [];
      for (let j = 0; j < GRID_WIDTH; j++) {
        grid[i][j] = null;
      }
    }
    let currentTetromino = new Tetromino('I');
    let touchX = 0;
    let touchY = 0;
    let touchStarted = false;

    // Handle touch events
    app.view.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
      touchStarted = true;
    });
    app.view.addEventListener('touchmove', (e) => {
      if (touchStarted) {
        const newX = e.touches[0].clientX;
        const newY = e.touches[0].clientY;
        if (newX < touchX) {
          currentTetromino.x -= 1;
        } else if (newX > touchX) {
          currentTetromino.x += 1;
        }
        if (newY < touchY) {
          currentTetromino.y -= 1;
        } else if (newY > touchY) {
          currentTetromino.y += 1;
        }
        touchX = newX;
        touchY = newY;
      }
    });
    app.view.addEventListener('touchend', () => {
      touchStarted = false;
    });

    // Update game state
    app.ticker.add(() => {
      try {
        // Move current tetromino down
        currentTetromino.y += 1;

        // Check collision with grid
        for (const block of currentTetromino.blocks) {
          const x = currentTetromino.x + block[0];
          const y = currentTetromino.y + block[1];
          if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT || grid[y][x] !== null) {
            // Collision detected, move tetromino up and add to grid
            currentTetromino.y -= 1;
            for (const block of currentTetromino.blocks) {
              const x = currentTetromino.x + block[0];
              const y = currentTetromino.y + block[1];
              grid[y][x] = currentTetromino.type;
            }

            // Check for full lines and remove them
            for (let i = 0; i < GRID_HEIGHT; i++) {
              let isFullLine = true;
              for (let j = 0; j < GRID_WIDTH; j++) {
                if (grid[i][j] === null) {
                  isFullLine = false;
                  break;
                }
              }
              if (isFullLine) {
                // Remove full line
                for (let j = 0; j < GRID_WIDTH; j++) {
                  grid[i][j] = null;
                }
                // Move lines down
                for (let k = i; k > 0; k--) {
                  for (let j = 0; j < GRID_WIDTH; j++) {
                    grid[k][j] = grid[k - 1][j];
                  }
                }
              }
            }

            // Create new tetromino
            currentTetromino = new Tetromino('I');
          }
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    });

    // Render game state
    app.ticker.add(() => {
      try {
        app.stage.removeChildren();

        // Draw grid
        for (let i = 0; i < GRID_HEIGHT; i++) {
          for (let j = 0; j < GRID_WIDTH; j++) {
            if (grid[i][j] !== null) {
              const block = new PIXI.Graphics();
              block.beginFill(COLOR_MAP[grid[i][j]]);
              block.drawRect(j * BLOCK_SIZE, i * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
              block.endFill();
              app.stage.addChild(block);
            }
          }
        }

        // Draw current tetromino
        for (const block of currentTetromino.blocks) {
          const x = currentTetromino.x + block[0];
          const y = currentTetromino.y + block[1];
          if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            const blockSprite = new PIXI.Graphics();
            blockSprite.beginFill(COLOR_MAP[currentTetromino.type]);
            blockSprite.drawRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            blockSprite.endFill();
            app.stage.addChild(blockSprite);
          }
        }
      } catch (error) {
        console.error('Error rendering game state:', error);
      }
    });