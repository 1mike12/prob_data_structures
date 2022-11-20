import BitField from "./BitField"
import { deepEqual, equal } from "assert"
import BloomFilter from "./index"

describe("BitField", () => {

   it("should be able to construct from buffer", () => {
      const field = BitField.from(Buffer.from([0b11000001, 0b00000001]))
      equal(field.get(0), 1)
      equal(field.get(2), 0)
      equal(field.get(7), 1)
      equal(field.get(8), 1)
      equal(field.get(15), 0)
   })

   it("should set and get bits", () => {
      const field = new BitField(16)
      field.set(0, 1)
      field.set(1, 1)
      equal(field.get(0), 1)
      equal(field.get(1), 1)
      equal(field.get(2), 0)
   })

   it("should have accurate oneCount", () => {
      const filter = new BitField(16)
      equal(filter.oneCount, 0)
      filter.set(0, 1)
      equal(filter.oneCount, 1)
      filter.set(1, 1)
      equal(filter.oneCount, 2)
      filter.set(0, 0)
      equal(filter.oneCount, 1)
      filter.set(1, 0)
      equal(filter.oneCount, 0)
   })

   it("should be able to set bitfield with more than 1 byte worth of bits", () => {
      const field = new BitField(16)
      for (let i = 0; i < 16; i++) {
         field.set(i, 1)
      }
      equal(field.numberOfOnes(), 16)
   })

   it("should iterate over bits", () => {
      const field = BitField.from(Buffer.from([0b11000001, 0b00000001]))
      const result = []
      for (let bit of field) {
         result.push(bit)
      }
      equal(result.length, 16)
      deepEqual(result, [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])
   })
})
