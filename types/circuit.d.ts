import { Point, G1Point, G2Point, Groth16Proof, SnarkJSGroth16Proof, FieldElement, StringFieldElement } from "./types.js";
export type Groth16VerificationKey = {
    protocol: string;
    curve: string;
    nPublic: number;
    vk_alpha_1: G1Point;
    vk_beta_2: G2Point;
    vk_gamma_2: G2Point;
    vk_delta_2: G2Point;
    vk_alphabeta_12: [
        [
            Point,
            Point,
            Point
        ],
        [
            Point,
            Point,
            Point
        ]
    ];
    IC: G1Point[];
};
export declare class CircuitSetup {
    zKey: string | Uint8Array;
    wasm: string | Uint8Array;
    r1cs?: string | Uint8Array;
    csHash?: Uint8Array;
    constructor(zKey: string | Uint8Array, wasm: string | Uint8Array, r1cs?: string | Uint8Array, csHash?: Uint8Array);
    get circuitHash(): string;
    get keyHash(): Promise<string | ArrayBuffer>;
    get verificationKey(): Promise<Groth16VerificationKey>;
    solidityVerifier(template_name?: string): Promise<string>;
    prove(inputs: object): Promise<CircuitProof>;
    verify(proof: CircuitProof): Promise<boolean>;
}
export declare class CircuitWitness {
    _symbols: object;
    _witness: BigInt[];
    constructor(_symbols: object, _witness: BigInt[]);
    varIndex(varName: any): any;
    varMatch(pattern: any): string[];
    value(varName: any): BigInt;
    map(arrName: any): any[];
    array(arrName: any): BigInt[];
    match(pattern: any): BigInt[];
}
export declare class CircuitProof {
    protected _proof: SnarkJSGroth16Proof;
    protected _signals: StringFieldElement[];
    constructor(_proof: SnarkJSGroth16Proof, _signals: StringFieldElement[]);
    get snarkjs_proof(): SnarkJSGroth16Proof;
    get snarkjs_signals(): StringFieldElement[];
    get proof(): Groth16Proof;
    get signals(): FieldElement[];
    toObject(): object;
    toHexlified(): object;
    toJSON(indent?: boolean): string;
}
