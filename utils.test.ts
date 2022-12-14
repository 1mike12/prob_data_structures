import { equal, deepEqual } from "assert"
import {
   getBitAtIndex,
   getSmallestXPercent,
   harmonicMean,
   iteratorFromBuffer,
   reverseByte,
   setBitAtIndex,
} from "./utils"
import BitField from "./BitField"

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

   it("should reverse byte", () => {
      equal(reverseByte(0b10000000), 0b00000001)
      equal(reverseByte(0b11000000), 0b00000011)
      equal(reverseByte(0b11100000), 0b00000111)
      equal(reverseByte(0b11110000), 0b00001111)
      equal(reverseByte(0b11111000), 0b00011111)
      equal(reverseByte(0b11111100), 0b00111111)
      equal(reverseByte(0b11111110), 0b01111111)
   })

   it("should toString", () => {
      const field = BitField.from(Buffer.from([0b10000000, 0b000000011]))
      equal(field.toString(true), "0b00000001 0b11000000")
      equal(field.toString(false), "00000001 11000000")
   })

   it("should calculate harmonic mean", () => {
      equal(harmonicMean([1, 4, 4]), 2)
      equal(harmonicMean([1, 4, 4, 10]), 2.5)
   })

   it("should get smallest x percent", () => {
      deepEqual(getSmallestXPercent([1, 2, 3, 4, 5, 6], 0.5), [1, 2, 3])
      deepEqual(getSmallestXPercent([1, 2, 3, 4, 5, 6, 7, 8], 0.25), [1, 2])
   })
})
