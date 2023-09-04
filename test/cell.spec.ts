import { assert } from "chai";
import { wasm as circom_wasm } from "circom_tester";

import { CircuitTester } from "../src/tester.js";

describe("Cell Test", () => {
    const cir = new CircuitTester(circom_wasm, "cell.circom", "Cell", [])

    before(async function() {
        this.timeout(100000);
        await cir.compile({ "O": true })

        console.log(`Constraints: `, cir.constraints.length)
    });

    it("Underpopulation", async () => {
        const witness = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [0, 0, 0, 0, 0, 0, 0, 0]
        })

        assert.equal(witness.value("main.next_alive"), 0n)
    })

    it("Overpopulation", async () => {
        const witness = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [1, 1, 1, 1, 1, 1, 1, 1]
        })

        assert.equal(witness.value("main.next_alive"), 0n)
    })

    it("Survival", async () => {
        const witness_1 = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [1, 0, 0, 0, 0, 0, 0, 0]
        })

        assert.equal(witness_1.value("main.next_alive"), 0n)

        const witness_2 = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [1, 1, 0, 0, 0, 0, 0, 0]
        })

        assert.equal(witness_2.value("main.next_alive"), 1n)

        const witness_3 = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [1, 1, 1, 0, 0, 0, 0, 0]
        })

        assert.equal(witness_3.value("main.next_alive"), 1n)

        const witness_4 = await cir.calculateWitness({
            "alive": 1,
            "neighbourhood": [1, 1, 1, 1, 0, 0, 0, 0]
        })

        assert.equal(witness_4.value("main.next_alive"), 0n)
    })

    it("Birth", async () => {
        const witness = await cir.calculateWitness({
            "alive": 0,
            "neighbourhood": [1, 1, 1, 0, 0, 0, 0, 0]
        })

        assert.equal(witness.value("main.next_alive"), 1n)

        const witness_2 = await cir.calculateWitness({
            "alive": 0,
            "neighbourhood": [1, 1, 1, 1, 0, 0, 0, 0]
        })

        assert.equal(witness_2.value("main.next_alive"), 0n)
    })
})