pragma circom 2.1.5;

include "state.circom";
include "round.circom";

template Universe(x, y) {
    signal input seedOrSwitch;
    signal input start[x * y];
    
    // seedOrSwitch might be 0, 1, or a 254-bit scalar. If it's 0 or 1,
    // we want it to decide whether to use the seed or the start bits.
    // If it's a 254-bit scalar, we want to use it as the seed.
    // We need to convert it to a 1-bit signal, so we can use it as a
    // selector for the BitSwitcher.
    signal isSwitch <== LessThan(254) ([seedOrSwitch, 2]);
    signal switch <== seedOrSwitch * isSwitch;

    // If isSwitch is 0, then we use the seed. If it's 1, then we use the
    // start bits.
    signal startBits[x * y] <== BitSwitcher(x * y) (
        isSwitch,
        RandomBits(x * y) (seedOrSwitch),
        start
    );

    signal endBits[x * y] <== UniverseRound(x, y) (startBits);

    // How many 254-bit elements do we need to represent the universe?
    var elements = ((x * y) + 253 \ 254);

    // Between invocations of the circuit, we want to alternate between
    // left and right being the starting state, so as to be able to reuse
    // the section of the pairing check during verification.
    signal output L[elements];
    signal output R[elements];

    
}