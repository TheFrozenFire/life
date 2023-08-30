import { importSnarkJS } from "../dist/snarkjs.js";
import { groth16, zKey as zKeyGen } from "snarkjs";

const snarkjs = {
    prove: groth16.fullProve,
    verify: groth16.verify,
    newZKey: zKeyGen.newZKey,
    exportVerificationKey: zKeyGen.exportVerificationKey,
    exportSolidityVerifier: zKeyGen.exportSolidityVerifier,
    exportSolidityCalldata: groth16.exportSolidityCallData
}
importSnarkJS(snarkjs)