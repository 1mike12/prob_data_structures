import { equal, deepEqual } from "assert"
import { getDistanceToNext1, getNSignificantBits } from "./utils"

describe("utils", () => {

   it("should get distance to next 1 of single byte", () => {
      const byte = Buffer.from([0b00000001])
      equal(getDistanceToNext1(byte, 0), 8)
      equal(getDistanceToNext1(byte, 1), 7)
      equal(getDistanceToNext1(byte, 6), 2)
      equal(getDistanceToNext1(byte, 7), 1)

      const another = Buffer.from([0b00010011])
      equal(getDistanceToNext1(another, 0), 4)
      equal(getDistanceToNext1(another, 7), 1)
   })

   it("should get distance to next 1 of two bytes", () => {
      const twoBytes = Buffer.from([0b00000000, 0b00000001])
      equal(getDistanceToNext1(twoBytes, 0), 16)
      equal(getDistanceToNext1(twoBytes, 15), 1)
   })

   it("should get n significant bits of buffer", () => {
      const byte = Buffer.from([0b01000001])
      equal(getNSignificantBits(byte, 1), 0)
      equal(getNSignificantBits(byte, 2), 1)
      equal(getNSignificantBits(byte, 3), 2)
   })

   it("should get n significant bits of two byte buffer", () => {
      const twoBytes = Buffer.from([0b00000001, 0b10000001])
      equal(getNSignificantBits(twoBytes, 8), 1)
      equal(getNSignificantBits(twoBytes, 9), 3)
      equal(getNSignificantBits(twoBytes, 10), 6)
   })
})
