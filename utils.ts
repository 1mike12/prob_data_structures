/**
 * return the bit value given the buffer index and bit index within that array
 *
 * @param buffer The Buffer/UInt8Array to read the bit from.
 * @param index The zero-based cardinal index of the byte to read the bit from.
 * @param bit The zero-based cardinal index of the bit to read from the byte.
 * @return The bit value.
 */
export function readBit(buffer: Buffer, index: number, bit: number): number {
   /*
   The right shift operator (>>) returns the signed number represented by the result of performing a sign-extending shift of the binary representation of the first operand (evaluated as a two's complement bit string) to the right by the number of bits, modulo 32, specified in the second operand. Excess bits shifted off to the right are discarded, and copies of the leftmost bit are shifted in from the left.
    */

   /*
   in order to select the only bit we care about, we & the byte with `1` which can be thought of as a bitmask to select the elast significant bit
    */
   return (buffer[index] >> bit) & 1
}

/**
 * given an bit index and a buffer, this will give the number of bits
 * we need to travel right to reach the next 1
 *
 * given [0b00000001] and a bit index of 0, this will return 7
 *
 * @param buffer
 * @param startingIndex
 */
export function getDistanceToNext1(buffer: Buffer, startingIndex: number): number {
   let index = startingIndex
   const totalBits = buffer.byteLength * 8
   let distance = 0
   while (index < totalBits) {
      distance++
      let byte = buffer[Math.floor(index / 8)]
      const bit = index % 8
      byte = byte << bit
      if (byte & 0b10000000) {
         return distance
      }
      index++
   }
   return index - startingIndex
}

/**
 * given a buffer and a number of bits, this will return a "slice" of the bits from 0 to n
 *
 * given the buffer [0b00000001, 0b11111111] and an end of 10, this will return 0b0000000111
 *
 * @param buffer
 * @param end is 0 indexed
 */
export function getNSignificantBits(buffer: Buffer, end: number): number {
   let result = 0
   let index = 0
   const totalBits = buffer.byteLength * 8

   while (index < end && index < totalBits) {
      let byte = buffer[Math.floor(index / 8)]
      const bitValue = byte >> (7 - (index % 8)) & 1
      result = result << 1
      result = result | bitValue
      index++
   }
   return result
}

/**
 * get a mean that is less sensitive to outliers
 * @param values
 */
export function harmonicMean(values: number[]): number {
   const sumOfInverses = values.reduce((sum, value) => sum + 1 / value, 0)
   return values.length / sumOfInverses
}

/**
 * used to grab the ie 70% smallest values in the bucket array to throw away outliers
 * @param values
 * @param percent range [0, 1]
 */
export function getSmallestXPercent(values: number[], percent: number): number[] {
   const sorted = values.sort((a, b) => a - b)
   const count = Math.floor(values.length * percent)
   return sorted.slice(0, count)
}
