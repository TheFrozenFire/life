type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number
type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [Symbol.iterator]: () => IterableIterator< ArrayItems<T> > }

export type FieldElement = BigInt | bigint
export type Pi_Point = FixedLengthArray<[FieldElement, FieldElement, FieldElement]>
export type Point = FixedLengthArray<[FieldElement, FieldElement]>
export type G1Point = FixedLengthArray<[FieldElement, FieldElement, number]>
export type G2Point = FixedLengthArray<[Point, [number, number]]>

export type StringFieldElement = string
export type StringPi_Point = FixedLengthArray<[StringFieldElement, StringFieldElement, StringFieldElement]>
export type StringPoint = FixedLengthArray<[StringFieldElement, StringFieldElement]>

export interface ECCryptoSuite {
  poseidon: any;
  babyJub: any;
  eddsa: any;
  Scalar: any;
  PrivateKey: any;
  stringifyBigInts: any;
}

export type SnarkJSProverResult = {
  proof: SnarkJSGroth16Proof,
  publicSignals: string[]
}
export type ProverResult = {
  proof: Groth16Proof,
  publicSignals: string[]
}
export interface SnarkJS {
  prove(inputs: object, wasmFile: string | Uint8Array, zKey: string | Uint8Array, _logger?: object): Promise<ProverResult>
  verify(verificationKey: object, signals: object, proof: Groth16Proof, _logger?: object): Promise<boolean>
  newZKey(r1csFile: string | Uint8Array, ptauFile: string | Uint8Array, zKeyFile: string | Uint8Array, _logger?: object): Promise<Uint8Array>
  exportVerificationKey(zKey: string | Uint8Array): object
  exportSolidityVerifier(zKey: string | Uint8Array, templates: object, _logger?: object): Promise<string>
  exportSolidityCallData(proof: Groth16Proof, signals: object): Promise<string>
}

export type SolidityProof = string

export type SnarkJSGroth16Proof = { pi_a: StringPi_Point, pi_b: [StringPoint, StringPoint, StringPoint], pi_c: StringPi_Point }
export type Groth16Proof = { a: Point, b: [Point, Point], c: Point }