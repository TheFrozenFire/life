pragma circom 2.1.5;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/gates.circom";
include "calculate_total.circom";

// Represents a cell's transition in Conway's game of life
template Cell() {
    signal input alive;
    signal input neighbourhood[8];

    signal living_neighbours <== CalculateTotal(8) (neighbourhood);

    // Any live cell with two or three live neighbours lives on to the next generation.
    signal survival <== OR() ( IsEqual() ([living_neighbours, 2]), IsEqual() ([living_neighbours, 3]) );

    // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    signal reproduction <== IsEqual() ([living_neighbours, 3]);

    // Calculate next state
    signal output next_alive <== OR() ( AND() ( alive, survival ), AND() ( NOT() ( alive ), reproduction ) );
}