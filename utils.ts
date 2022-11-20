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

export function reverseByte(b: number) {
   b = (b & 0xF0) >> 4 | (b & 0x0F) << 4
   b = (b & 0xCC) >> 2 | (b & 0x33) << 2
   b = (b & 0xAA) >> 1 | (b & 0x55) << 1
   return b
}

export function byteToBinaryString(byte: number): string {
   return byte.toString(2).padStart(8, "0")
}

/**
 * get a mean that is less sensitive to outliers
 * @param values
 */
export function harmonicMean(values: number[]): number {
   let sum = 0
   for (const value of values) {
      sum += 1 / value
   }
   return values.length / sum
}

/**
 * used to grab the ie 70% smallest values in the bucket array to throw away outliers
 * @param values
 * @param percent range [0, 1]
 */
export function getSmallestXPercent(values: number[], percent: number): number[] {
   const copy = [...values]
   copy.sort((a, b) => a - b)
   const count = Math.floor(values.length * percent)
   return copy.slice(0, count)
}

