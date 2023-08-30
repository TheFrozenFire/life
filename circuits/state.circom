pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "calculate_total.circom";

template Bitmap(x, y) {
    signal input {binary} grid_start[y][x];
    signal input {binary} grid_end[y][x];

    signal output start_row[y];

    signal output end_row[y];

    for(var i = 0; i < y; i++) {
        start_row[i] <== Bits2Num_strict(x) (grid_start[i]);
        end_row[i] <== Bits2Num_strict(x) (grid_end[i]);
    }

    signal output start <== CalculateTotal(y) (start_row);
    signal output end <== CalculateTotal(y) (end_row);
}