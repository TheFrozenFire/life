import temp from "temp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import {
  CircuitSetup,
  CircuitWitness,
  CircuitProof,
} from "./circuit.js";
import { snarkjs } from "./snarkjs.js";

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

export async function genMain(
  circom_wasm: CircomWasm,
  template_file,
  template_name,
  params = [],
  circom_options = undefined,
  circom_pragma = "2.0.0",
  public_inputs = []
) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  circom_options = Object.assign({ O: 0 }, circom_options);

  temp.track();

  const temp_circuit = await temp.open({
    prefix: template_name,
    suffix: ".circom",
  });
  const params_string = JSON.stringify(params).slice(1, -1);
  const public_inputs_string = public_inputs.join(", ");
  const public_inputs_declaration =
    public_inputs.length > 0 ? `{public [${public_inputs_string}] }` : "";

  fs.writeSync(
    temp_circuit.fd,
    `
pragma circom ${circom_pragma};

include "${template_file}";

component main ${public_inputs_declaration} = ${template_name}(${params_string});
    `
  );

  return circom_wasm(temp_circuit.path, circom_options);
}

export class Circuit {
  private _circuit;

  private _setup: CircuitSetup;

  private _tester: any;
  private _circom_options: object = undefined;
  private _circom_pragma: string = "2.0.0";
  private _public_inputs: string[];

  constructor(
    private circom_wasm: CircomWasm,
    private _template_file: string,
    private _template_name: string,
    private _params: number[],
    private _include: string[] = ["circuits"]
  ) {}

  set options(_options: object) {
    this._circom_options = _options;
  }

  set public_inputs(_inputs: string[]) {
    this._public_inputs = _inputs;
  }
  
  get F() {
    return this._circuit.F
  }
  
  get nVars() {
    return this._circuit.nVars
  }
  
  get constraints() {
    return this._circuit.constraints
  }
  
  get symbols() {
    return this._circuit.symbols
  }

  include(path: string) {
    this._include.push(path)
  }
  
  async _compile(options: object = undefined) {
    const circuit = await genMain(
      this.circom_wasm,
      this._template_file,
      this._template_name,
      this._params,
      Object.assign({}, this._circom_options, { include: this._include }, options),
      this._circom_pragma,
      this._public_inputs
    );

    await Promise.all([circuit.loadSymbols(), circuit.loadConstraints()])
    
    return circuit
  }

  async compile(options: object = undefined) {
    this._circuit = await this._compile(options)
  }
  
  async compileWithOpt() {
    return Promise.all([this.compile(), this._compile({ "O": true })]).then((circuits) => circuits[1])
  }

  async setup(ptauFile: string): Promise<CircuitSetup> {
    const r1csFile = path.join(
      this._circuit.dir,
      this._circuit.baseName + ".r1cs"
    );
    const zKeyFile = path.join(
      this._circuit.dir,
      this._circuit.baseName + ".zkey"
    );
    const wasmFile = path.join(
      this._circuit.dir,
      this._circuit.baseName + "_js/" + this._circuit.baseName + ".wasm"
    );

    this._setup = new CircuitSetup(
      zKeyFile,
      wasmFile,
      r1csFile,
      await snarkjs.newZKey(r1csFile, ptauFile, zKeyFile)
    );

    return this._setup;
  }

  async checkConstraints(witness: CircuitWitness) {
    return this._circuit.checkConstraints(witness._witness);
  }

  async calculateWitness(inputs: object): Promise<CircuitWitness> {
    return new CircuitWitness(
      this._circuit.symbols,
      await this._circuit.calculateWitness(inputs)
    );
  }

  async prove(inputs: object): Promise<CircuitProof> {
    return this._setup.prove(inputs);
  }
}

export const CircuitTester = Circuit;
