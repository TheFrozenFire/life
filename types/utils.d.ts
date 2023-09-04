/// <reference types="node" resolution-mode="require"/>
export declare function arrayChunk(array: any, chunk_size: any): any[];
export declare function trimEndByChar(string: any, character: any): any;
export declare function getJSONFieldLength(input: any, field: any): any;
export declare function getBase64JSONSlice(input: any, field: any): number[];
export declare function buffer2BitArray(b: any): any[];
export declare function bitArray2Buffer(a: any): Buffer;
export declare function bigIntArray2Bits(arr: any, intSize?: number): (0 | 1)[];
export declare function bigIntArray2Buffer(arr: any, intSize?: number): Buffer;
export declare function uint8Array2Hex(arr: any): string;
export declare function getWitnessValue(witness: any, symbols: any, varName: any): any;
export declare function getWitnessMap(witness: any, symbols: any, arrName: any): {
    name: string;
    value: any;
}[];
export declare function getWitnessArray(witness: any, symbols: any, arrName: any): any[];
export declare function getWitnessBuffer(witness: any, symbols: any, arrName: any, varSize?: number): Buffer;
export declare function fromString(s: any, radix: any): bigint;
export declare function fromRprLE(buff: any, o: any, n8?: any): bigint;
export declare function unstringifyBigInts(o: any): any;
export declare function ifyBigInts(o: any, recurse: any, ifier: any): any;
export declare function stringifyBigInts(o: any): any;
export declare function hexlifyBigInts(o: any): any;
