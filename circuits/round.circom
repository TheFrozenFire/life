pragma circom 2.1.5;

include "cell.circom";

template UniverseRound(x, y) {
    var cells = x * y;

    signal input start[cells];
    signal output end[cells];

    var start_grid[y][x];
    var end_grid[y][x];

    for(var i = 0; i < y; i++) {
        for(var j = 0; j < x; j++) {
            start_grid[i][j] <== start[i * x + j];
        }
    }

    for(var i = 0; i < y; i++) {
        for(var j = 0; j < x; j++) {
            end_grid[i][j] <== Cell() (start_grid[i][j], [
                start_grid[(i - 1 + y) % y][(j - 1 + x) % x],
                start_grid[(i - 1 + y) % y][j],
                start_grid[(i - 1 + y) % y][(j + 1) % x],
                start_grid[i][(j - 1 + x) % x],
                start_grid[i][(j + 1) % x],
                start_grid[(i + 1) % y][(j - 1 + x) % x],
                start_grid[(i + 1) % y][j],
                start_grid[(i + 1) % y][(j + 1) % x]
            ]);
        }
    }

    for(var i = 0; i < y; i++) {
        for(var j = 0; j < x; j++) {
            end[i * x + j] <== end_grid[i][j];
        }
    }
}