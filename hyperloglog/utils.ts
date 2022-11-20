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
   return distance
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
