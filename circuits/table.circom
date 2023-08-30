pragma circom 2.1.5;

include "../circomlib/circuits/comparators.circom";
include "../operation/calculate_total.circom";

// Each table has a number of rows and columns.
// The first `keys` columns are used to index the table.
// The remaining columns are the values.

template InArray(nElements) {
    signal input elements[nElements];
    signal input value;

    component sum = CalculateTotal(nElements);
    signal eq[nElements];
    for(var i = 0; i < nElements; i++) {
        eq[i] <== IsEqual() ([elements[i], value]);
        sum.nums[i] <== eq[i];
    }

    sum.sum === 1;
}

template TableIndexLookup(rows, keys, columns) {
    signal input table[rows][keys + columns];

    signal input index;

    signal output out[columns];

    signal eq[rows];
    signal column_values[columns][rows];
    for(var row = 0; row < rows; row++) {
        eq[row] <== IsEqual() ([row, index]);

        for(var column = keys; column < columns; column++) {
            column_values[column][row] <== table[row][column] * eq[row];
        }
    }

    for(var column = keys; column < columns; column++) {
        out[column] <== CalculateTotal(rows) (column_values[column]);
    }
}

template TableKeyLookup(rows, keys, columns) {
    signal input table[rows][keys + columns];

    signal input key_index;
    signal input key_value;

    signal output out[columns];

    signal row_key_idx_eq[rows][keys];
    signal row_key_values[rows][keys];
    signal row_key_value[rows];

    signal row_key_eq[rows];
    signal column_values[columns][rows];
    for(var row = 0; row < rows; row++) {
        for(var key = 0; key < keys; key++) {
            row_key_idx_eq[row][key] <== IsEqual() ([key, key_index]);
            row_key_values[row][key] <== table[row][key] * row_key_idx_eq[row][key];
        }
        row_key_value[row] <== CalculateTotal(keys) (row_key_values[row]);

        row_key_eq[row] <== IsEqual() ([row_key_value[row], key_value]);

        for(var column = keys; column < columns; column++) {
            column_values[column][row] <== table[row][column] * row_key_eq[row];
        }
    }

    for(var column = keys; column < columns; column++) {
        out[column] <== CalculateTotal(rows) (column_values[column]);
    }
}