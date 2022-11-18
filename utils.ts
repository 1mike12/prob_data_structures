export function getBitAtIndex(buffer: Buffer, index: number): number {
   const byte = buffer[Math.floor(index / 8)]
   const bit = index % 8
   return (byte >> (7 - bit)) & 1
}

export function setBitAtIndex(buffer: Buffer, index: number, value: number) {
   const byteIndex = Math.floor(index / 8)
   const bit = index % 8
   const byte = buffer[byteIndex]
   const mask = 0b10000000 >> bit
   const newValue = value ? byte | mask : byte & ~mask
   buffer[byteIndex] = newValue
}

export function iteratorFromBuffer(buffer: Buffer): IterableIterator<number> {
   let index = 0
   const bitLength = buffer.length * 8
   return {
      [Symbol.iterator]() {
         return this
      },
      next() {
         if (index >= bitLength) {
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

export function bufferToBinaryString(buffer: Buffer): string {
   function byteToBinaryString(s) {
      return s.toString(2).padStart(8, '0');
   }
   return [...buffer].map(byteToBinaryString).join(" ")
}
