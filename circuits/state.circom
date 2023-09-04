pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/poseidon.circom";
include "calculate_total.circom";

template RandomBits(n) {
    signal input seed;

    // Poseidon outputs 254 bits of randomness per call, as a scalar value.
    // We can use this to generate a grid of random bits. We need to calculate
    // the number of cells in the grid, and then use that to determine how many
    // times to call Poseidon.
    var calls = (n + 253) \ 254; // Round up to the number of whole poseidon calls we need

    signal oracle[calls];
    signal bits[calls][254];
    oracle[0] <== Poseidon(1) (seed);
    for(var i = 1; i < calls; i++) {
        oracle[i] <== Poseidon(oracle[i-1]);
        bits[i-1] <== Num2Bits(254) (oracle[i-1]);
    }
    bits[calls-1] <== Num2Bits(254) (oracle[calls-1]);

    signal output out[n];
    for(var i = 0; i < n; i++) {
        out[i] <== bits[i\254][i%254];
    }
}

template InputBits(n) {
    var elements = (n + 253) \ 254;

    signal input in[elements];

    signal bits[elements][254];
    for(var i = 0; i < elements; i++) {
        bits[i] <== Num2Bits(254) (in[i]);
    }

    signal output out[n];
    for(var i = 0; i < n; i++) {
        out[i] <== bits[i\254][i%254];
    }
}

template BitSwitcher(n) {
    signal input {binary} switch;

    signal input {binary} L[n];
    signal input {binary} R[n];

    signal aux <== (R - L) * switch;

    signal output {binary} out[n];
    for(var i = 0; i < n; i++) {
        // If switch is 0, then aux is 0, so out is L
        // If switch is 1, then aux is R - L, so out is R
        out[i] <== L[i] + aux;
    }
}