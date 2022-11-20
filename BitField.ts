import { byteToBinaryString, reverseByte } from "./utils"

export default class BitField {
   private buffer: Buffer
   public length: number
   public oneCount: number

   constructor(length: number) {
      this.length = length
      this.buffer = Buffer.alloc(Math.ceil(length / 8))
      this.oneCount = 0
   }

   static from(buffer: Buffer): BitField {
      const bitField = new BitField(buffer.length * 8)
      bitField.buffer = buffer
      return bitField
   }

   get(index: number): number {
      const byte = this.buffer[Math.floor(index / 8)]
      const bit = index % 8
      return byte >> bit & 1
   }

   set(index: number, bitValue: number) {
      if (bitValue !== 0 && bitValue !== 1) throw new Error("value must be 0 or 1")
      if (index >= this.length) throw new Error("index out of bounds")

      const byteIndex = Math.floor(index / 8)
      const bit = index % 8
      const byte = this.buffer[byteIndex]
      const mask = 1 << bit
      const newValue = bitValue ? byte | mask : byte & ~mask
      if (byte !== newValue) {
         this.buffer[byteIndex] = newValue
         if (bitValue === 1) {
            this.oneCount++
         } else {
            this.oneCount--
         }
      }
   }

   map<T>(fn: (bit: number, index: number) => T): T[] {
      const result = []
      let index = 0
      for (const bit of this) {
         result.push(fn(bit, index))
         index++
      }
      return result
   }

   toString(withBinaryMarkers = false): string {
      const output = []
      const binaryMarker = withBinaryMarkers ? "0b" : ""
      for (const byte of this.buffer) {
         const reversed = reverseByte(byte)
         const binaryString = `${binaryMarker}${byteToBinaryString(reversed)}`
         output.push(binaryString)
      }
      return output.join(" ")
   }

   numberOfOnes(): number {
      return this.oneCount
   }

   [Symbol.iterator]() {
      const { buffer, length } = this
      let index = 0
      let byte = buffer[0]
      return {
         next() {
            if (index >= length) {
               return { done: true, value: undefined }
            }
            if (index % 8 === 0) {
               byte = buffer[Math.floor(index / 8)]
            }
            const value = byte & 1
            byte >>= 1
            index++
            return { done: false, value }
         },
      }
   }
}
