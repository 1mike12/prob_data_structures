import { XXHash32 } from "xxhash-addon"
import { equal, ok, notEqual, deepEqual } from "assert"
import BloomFilter from "./BloomFilter"

function closelyEqual(a: number, b: number, error: number) {
   ok(Math.abs(a - b) < (a * error))
}

describe("BloomFilter", () => {
   const hashFunction = (value: string) => {
      return XXHash32.hash(Buffer.from(value))
   }

   it("should insert values without crashing", () => {
      const filter = new BloomFilter(hashFunction)
      filter.insert("hello")
      filter.insert("world")
   })

   it("should definitely not contain uninserted values", () => {
      const filter = new BloomFilter(hashFunction)
      ok(!filter.contains("trotzdem"))
   })

   it("should contain inserted values", () => {
      const filter = new BloomFilter(hashFunction)
      filter.insert("test")
      ok(filter.contains("test"))
   })

   it("should generateIndex positions", () => {
      const output = []
      for (let i = 0; i < 10; i++) {
         output.push(BloomFilter.generateIndex(0, 1, i, 50))
      }
      deepEqual(output, [0,
         1,
         3,
         7,
         14,
         25,
         41,
         13,
         42,
         29])
   })

   it("should get optimal bitfieldLength", () => {
      equal(BloomFilter.optimalBitFieldLength(1e6, 0.01), 9585064)
      equal(BloomFilter.optimalBitFieldLength(1e6, 0.20), 3349840)
   })
})
