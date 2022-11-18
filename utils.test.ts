import { equal, deepEqual } from "assert"
import { getBitAtIndex, iteratorFromBuffer, setBitAtIndex } from "./utils"

describe("utils", () => {
   it("should get bit at index", () => {
      const buffer = Buffer.from([0b10000001])
      equal(getBitAtIndex(buffer, 0), 1)
      equal(getBitAtIndex(buffer, 1), 0)
      equal(getBitAtIndex(buffer, 7), 1)
   })

   it("should set bit at index", () => {
      const buffer = Buffer.from([0b00000000])
      setBitAtIndex(buffer, 0, 1)
      deepEqual(buffer, Buffer.from([0b10000000]))
      setBitAtIndex(buffer, 1, 1)
      deepEqual(buffer, Buffer.from([0b11000000]))
   })

   it("should convert buffer to iterator", () => {
      const buffer = Buffer.from([0b11000001, 0b00000001])
      const iterator = iteratorFromBuffer(buffer)
      const result = []
      for (let bit of iterator) {
         result.push(bit)
      }
      deepEqual(result, [1, 1, 0, 0, 0, 0, 0, 1,
         0, 0, 0, 0, 0, 0, 0, 1])
   })
})
