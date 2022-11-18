import { XXHash32 } from "xxhash-addon"
import { equal, ok, notEqual } from "assert"
import BloomFilter from "./index"

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
      filter.insert("hello")
      ok(filter.contains("hello"))
   })
})
