pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/poseidon.circom";
include "calculate_total.circom";

template Bitmap(x, y) {
    // Grids are sparse, which allows for cheap mutation
    signal input {binary} grid_start[y][x];
    signal input {binary} grid_end[y][x];

    // Rows are dense, but constrained, allowing lossless output
    signal output start_row[y];
    signal output end_row[y];

    for(var i = 0; i < y; i++) {
        start_row[i] <== Bits2Num_strict(x) (grid_start[i]);
        end_row[i] <== Bits2Num_strict(x) (grid_end[i]);
    }

    // Adding rows together gives you a scalar commitment to the grid
    signal output start <== CalculateTotal(y) (start_row);
    signal output end <== CalculateTotal(y) (end_row);
}

template RandomGrid(x, y) {
    signal input seed;

    // Poseidon outputs 254 bits of randomness per call, as a scalar value.
    // We can use this to generate a grid of random bits. We need to calculate
    // the number of cells in the grid, and then use that to determine how many
    // times to call Poseidon.
    var cells = x * y;
    var calls = (cells + 253) \ 254; // Round up to the number of whole poseidon calls we need

    signal oracle[calls];
    signal bits[calls];
    oracle[0] <== Poseidon(1) (seed);
    for(var i = 1; i < calls; i++) {
        oracle[i] <== Poseidon(oracle[i-1]);
        bits[i-1] <== Num2Bits(254) (oracle[i-1]);
    }
    bits[calls-1] <== Num2Bits(254) (oracle[calls-1]);

    // Now we have a source of bits, but we need to trim it to the right size
    signal output grid[y][x];
    for(var i = 0; i < y; i++) {
        for(var j = 0; j < x; j++) {
            grid[i][j] <== bits[i*x + j];
        }
    }
}