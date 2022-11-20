export default class BitField {
   private buffer: Buffer

   constructor(public length: number) {
      this.length = length
      this.buffer = Buffer.alloc(Math.ceil(length / 8))
   }

   static from(buffer: Buffer): BitField {
      const bitField = new BitField(buffer.length * 8)
      bitField.buffer = buffer
      return bitField
   }

   get(index: number): number {
      const byte = this.buffer[Math.floor(index / 8)]
      const bit = index % 8
      return (byte >> (7 - bit)) & 1
   }

   set(index: number, value: number) {
      if (value !== 0 && value !== 1) throw new Error("value must be 0 or 1")
      if (index >= this.length) throw new Error("index out of bounds")

      const byteIndex = Math.floor(index / 8)
      const bit = index % 8
      const byte = this.buffer[byteIndex]
      const mask = 0b10000000 >> bit
      const newValue = value ? byte | mask : byte & ~mask
      this.buffer[byteIndex] = newValue
   }

   numberOfOnes(): number {
      let count = 0
      for (const bit of this) {
         if (bit === 1) count++
      }
      return count
   }

   [Symbol.iterator]() {
      let index = 0
      const {buffer, length} = this
      return {
         next() {
            if (index >= length) {
               return { done: true, value: undefined }
            }
            const byte = buffer[Math.floor(index / 8)]
            const bit = index % 8
            const value = (byte >> (7 - bit)) & 1
            index++
            return { done: false, value }
         },
      }
   }
}
