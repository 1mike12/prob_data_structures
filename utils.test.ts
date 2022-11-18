import { equal, deepEqual } from "assert"
import { getDistanceToNext1, getNSignificantBits, getSmallestXPercent, harmonicMean, readBit } from "./utils"

describe("utils", () => {
   it("should readBit", () => {
      equal(readBit(new Buffer([0b00000000]), 0, 0), 0)
      equal(readBit(new Buffer([0b00000001]), 0, 0), 1)
      equal(readBit(new Buffer([0b00000010]), 0, 2), 0)

      const twoBytes = new Buffer([0b00000000, 0b00000001])
      equal(readBit(twoBytes, 0, 0), 0)
      equal(readBit(twoBytes, 1, 0), 1)
   })

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

   it("should calculate harmonic mean", () => {
      equal(harmonicMean([1, 4, 4]), 2)
      equal(harmonicMean([1, 4, 4, 10]), 2.5)
   })

   it("should get smallest x percent", () => {
      deepEqual(getSmallestXPercent([1, 2, 3, 4, 5, 6], 0.5), [1, 2, 3])
      deepEqual(getSmallestXPercent([1, 2, 3, 4, 5, 6, 7, 8], 0.25), [1, 2])
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
