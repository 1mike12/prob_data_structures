import BitField from "./BitField"
import { equal } from "assert"

describe("BitField", () => {

   it("should be able to construct from buffer", () => {
      const field = BitField.from(Buffer.from([0b11000001, 0b00000001]))
      equal(field.get(0), 1)
      equal(field.get(1), 1)
      equal(field.get(2), 0)
      equal(field.get(15), 1)
   })

   it("should set and get bits", () => {
      const field = new BitField(16)
      field.set(0, 1)
      field.set(1, 1)
      equal(field.get(0), 1)
      equal(field.get(1), 1)
      equal(field.get(2), 0)
   })

   it("should be able to set bitfield with more than 1 byte worth of bits", () => {
      const field = new BitField(16)
      for (let i = 0; i < 16; i++) {
         field.set(i, 1)
      }
      equal(field.numberOfOnes(), 16)
   })

   it("should iterate over bits", () => {
      const field = new BitField(3)
      field.set(0, 1)
      field.set(1, 1)
      field.set(2, 0)
      const result = []
      for (let bit of field) {
         result.push(bit)
      }
      equal(result[0], 1)
      equal(result[1], 1)
      equal(result[2], 0)
      equal(result.length, 3)
   })

})
