import { CircuitSetup, CircuitWitness, CircuitProof } from "./circuit.js";
export interface CircomWasm {
    (circuit: string, options?: object): Promise<WasmTester>;
}
export interface WasmTester {
    constraints: Array<Array<BigInt>>;
    symbols: Array<string>;
    nVars: number;
    F: BigInt;
    calculateWitness(inputs: object): Promise<Array<BigInt>>;
    loadSymbols(): Promise<undefined>;
    loadConstraints(): Promise<undefined>;
    checkConstraints(): Promise<undefined>;
}
export declare function genMain(circom_wasm: CircomWasm, template_file: any, template_name: any, params?: any[], circom_options?: any, circom_pragma?: string, public_inputs?: any[]): Promise<WasmTester>;
export declare class Circuit {
    private circom_wasm;
    private _template_file;
    private _template_name;
    private _params;
    private _include;
    private _circuit;
    private _setup;
    private _tester;
    private _circom_options;
    private _circom_pragma;
    private _public_inputs;
    constructor(circom_wasm: CircomWasm, _template_file: string, _template_name: string, _params: number[], _include?: string[]);
    set options(_options: object);
    set public_inputs(_inputs: string[]);
    get F(): any;
    get nVars(): any;
    get constraints(): any;
    get symbols(): any;
    include(path: string): void;
    _compile(options?: object): Promise<WasmTester>;
    compile(options?: object): Promise<void>;
    compileWithOpt(): Promise<WasmTester>;
    setup(ptauFile: string): Promise<CircuitSetup>;
    checkConstraints(witness: CircuitWitness): Promise<any>;
    calculateWitness(inputs: object): Promise<CircuitWitness>;
    prove(inputs: object): Promise<CircuitProof>;
}
export declare const CircuitTester: typeof Circuit;
