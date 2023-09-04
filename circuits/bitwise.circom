pragma circom 2.1.5;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/comparators.circom";

template BitwiseAND(n) {
    signal input a;
    signal input b;
    
    signal output out;
    
    component bitify[2];
    bitify[0] = Num2Bits(n);
    bitify[1] = Num2Bits(n);
    
    bitify[0].in <== a;
    bitify[1].in <== b;
    
    component debitify = Bits2Num(n);
    signal equality[n];
    for(var i = 0; i < n; i++) {
        // (2AB - A - B + 1) * B
        equality[i] <== (2 * bitify[0].out[i] * bitify[1].out[i]) - bitify[0].out[i] - bitify[1].out[i] + 1;
        debitify.in[i] <== equality[i] * bitify[1].out[i]; // Lower if b is low
    }
    
    out <== debitify.out;
}

template BitwiseOR(n) {
    signal input a;
    signal input b;
    
    signal a_bits[n] <== Num2Bits(n) (a);
    signal b_bits[n] <== Num2Bits(n) (b);
    
    component debitify = Bits2Num(n);
    for(var i = 0; i < n; i++) {
        // (A + B) - AB
        debitify.in[i] <== (a_bits[i] + b_bits[i]) - (a_bits[i] * b_bits[i]);
    }
    
    signal output out <== debitify.out;
}

template BitwiseNOT(n) {
    signal input a;
    
    signal output out <== (2**n) - a - 1;
}

template BitwiseXOR(n) {
    signal input a;
    signal input b;
    
    signal a_bits[n] <== Num2Bits(n) (a);
    signal b_bits[n] <== Num2Bits(n) (b);
    
    component debitify = Bits2Num(n);
    for(var i = 0; i < n; i++) {
        // A + B - 2AB
        debitify.in[i] <== (a_bits[i] + b_bits[i]) - (2 * a_bits[i] * b_bits[i]);
    }
    
    signal output out <== debitify.out;
}