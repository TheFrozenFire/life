import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"
import { snarkjs } from "./snarkjs.js"
import { Point, G1Point, G2Point, Groth16Proof, SnarkJSGroth16Proof, FieldElement, ProverResult, SnarkJSProverResult, StringFieldElement } from "./types.js"
import { hexlifyBigInts, unstringifyBigInts } from "./utils.js";
import crypto from "crypto"

export type Groth16VerificationKey = {
    protocol: string,
    curve: string,
    nPublic: number,
    vk_alpha_1: G1Point,
    vk_beta_2: G2Point,
    vk_gamma_2: G2Point,
    vk_delta_2: G2Point,
    vk_alphabeta_12: [
        [Point, Point, Point],
        [Point, Point, Point],
    ],
    IC: G1Point[]
}

export class CircuitSetup {
    constructor(
        public zKey: string | Uint8Array,
        public wasm: string | Uint8Array,
        public r1cs?: string | Uint8Array,
        public csHash?: Uint8Array
    ) {}
    
    get circuitHash(): string {
        if(this.csHash === undefined) {
            return '';
        }
    
        const a = new DataView(this.csHash.buffer, this.csHash.byteOffset, this.csHash.byteLength);
        let S = Array();
        
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                S.push(a.getUint32(i*16+j*4).toString(16).padStart(8, "0"))
            }
        }
        
        return S.join(" ")
    }

    get keyHash(): Promise<string | ArrayBuffer> {
        return this.verificationKey.then(
            // @ts-ignore
            (vk) => crypto.subtle.digest("SHA-256", JSON.stringify(vk)).then(
                (hash) => Buffer.from(hash).toString('hex')
            )
        )
    }
    
    get verificationKey(): Promise<Groth16VerificationKey> {
        return snarkjs.exportVerificationKey(this.zKey)
    }
    
    async solidityVerifier(template_name: string = 'verifier_groth16'): Promise<string> {
        const __dirname = path.dirname(fileURLToPath(import.meta.url))
        const templates = { groth16: await fs.promises.readFile(path.join(__dirname, `../templates/${template_name}.sol.ejs`), "utf8") }
    
        return await snarkjs.exportSolidityVerifier(this.zKey, templates)
    }
    
    async prove(inputs: object): Promise<CircuitProof> {
        const proof = await snarkjs.prove(inputs, this.wasm, this.zKey) as SnarkJSProverResult
        return new CircuitProof(proof.proof, proof.publicSignals)
    }
    
    async verify(proof: CircuitProof): Promise<boolean> {
        return snarkjs.verify(await this.verificationKey, proof.snarkjs_signals, proof.snarkjs_proof)
    }
}

export class CircuitWitness {
    constructor(
        public _symbols: object,
        public _witness: BigInt[]
    ) {}
    
    varIndex(varName) {
        return this._symbols[varName]['varIdx']
    }
    
    varMatch(pattern) {
        if(typeof pattern == "string") {
            pattern = RegExp(pattern.replaceAll("*", "\\w+").replaceAll(".", "\\."))
        }
        
        return Object.entries(this._symbols).filter(([index, symbol]) => index.match(pattern)).map(([index, symbol]) => index)
    }
    
    value(varName) {
        return this._witness[this.varIndex(varName)];
    }

    map(arrName) {
        return Object.entries(this._symbols).filter(([index, symbol]) => index.startsWith(arrName)).map(([index, symbol]) => Object.assign({}, symbol, { "name": index, "value": this._witness[symbol['varIdx']] }) );
    }

    array(arrName) {
        return Object.entries(this._symbols).filter(([index, symbol]) => index.startsWith(`${arrName}[`)).map(([index, symbol]) => this._witness[symbol['varIdx']] );
    }
    
    match(pattern) {
        return this.varMatch(pattern).map((symbol) => this.value(symbol))
    }
}

export class CircuitProof {
    constructor(
        protected _proof: SnarkJSGroth16Proof,
        protected _signals: StringFieldElement[]
    ) { }

    get snarkjs_proof(): SnarkJSGroth16Proof {
        return this._proof
    }

    get snarkjs_signals(): StringFieldElement[] {
        return this._signals
    }
    
    get proof(): Groth16Proof {
        const parsedProof = unstringifyBigInts(this._proof)
        return {
            a: parsedProof.pi_a.slice(0, 2) as Point,
            b: parsedProof.pi_b.slice(0, 2).map((point) => point.reverse()) as [ Point, Point ], // snarkjs reverse the beta proof elements
            c: parsedProof.pi_c.slice(0, 2) as Point
        }
    }
    
    get signals(): FieldElement[] {
        return unstringifyBigInts(this._signals)
    }

    toObject(): object {
        return {
            proof: this.proof,
            signals: this.signals
        }
    }

    toHexlified(): object {
        return hexlifyBigInts(this.toObject())
    }

    toJSON(indent = false): string {
        return JSON.stringify(this.toHexlified(), null, indent ? "  " : null)
    }
}
