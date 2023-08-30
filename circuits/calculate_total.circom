pragma circom 2.1.5;

// Returns the sum of the inputs.
// n must be greater than 0.
template CalculateTotal(n) {
    signal input nums[n];
    signal output sum;

    signal sums[n];
    sums[0] <== nums[0];

    for (var i=1; i < n; i++) {
        sums[i] <== sums[i - 1] + nums[i];
    }

    sum <== sums[n - 1];
}

template CalculateProduct(n) {
    signal input nums[n];
    signal output product;

    signal products[n];
    products[0] <== nums[0];

    for (var i=1; i < n; i++) {
        products[i] <== products[i - 1] * nums[i];
    }

    product <== products[n - 1];
}