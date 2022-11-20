import BitField from "./BitField"

export default class BloomFilter {
   private hashFunction: (value: string) => Buffer
   private hashCount: number
   private field: BitField

   constructor(hashFunction: (value: string) => Buffer, bitArrayLength = 1024, hashCount = 3) {
      this.field = new BitField(bitArrayLength)
      this.hashFunction = hashFunction
      this.hashCount = hashCount
   }

   indicesForValue(value: string) {
      const [startingIndex, offset] = this.getStartAndOffsetForValue(value)
      const indices = []
      for (let i = 0; i < this.hashCount; i++) {
         const index = BloomFilter.generateIndex(startingIndex, offset, i, this.field.length)
         indices.push(index)
      }
      return indices
   }

   /**
    * each byte of the hash will set a bit in the buffer
    *     [0b00000000 0b00000000 ............ 0b00000000]
    * index: 01234567   89...............              255
    *
    * the hash function has 32 bits, which is 4 bytes so every insertion
    * will set 4 bits in the buffer
    * @param value
    */
   insert(value: string) {
      const [startingIndex, offset] = this.getStartAndOffsetForValue(value)
      const indices = this.indicesForValue(value)
      for (let i = 0; i < this.hashCount; i++) {
         const index = BloomFilter.generateIndex(startingIndex, offset, i, this.field.length)
         this.field.set(index, 1)
      }
   }

   /**
    * called enhanced double hashing in paper (pg 103)
    *
    * gi =a+ib+(i)(i2−1) (mod m) (6.21)
    *
    * ![](https://i.imgur.com/ZlzJcVJ.png)
    * @param startingIndex generated by the first hash function
    * @param offset generated by the second hash function
    * @param i the ith hash (k in paper) that we are generating
    * @param bitFieldLength the total length of the bitfield (m in paper)
    */
   static generateIndex(startingIndex, offset, i, bitFieldLength) {
      const first = startingIndex + offset * i
      const numerator = i * (i**2 - 1)
      const index = (first + numerator/6) % bitFieldLength
      return index
   }

   toString() {
      return this.field.toString()
   }

   getStartAndOffsetForValue(value: string): [number, number] {
      const hash = this.hashFunction(value)
      const startingIndex = hash.readUInt16BE(0)
      const offset = hash.readUInt16BE(2)
      return [startingIndex, offset]
   }

   contains(value: string) {
      const [startingIndex, offset] = this.getStartAndOffsetForValue(value)
      const indices = this.indicesForValue(value)

      for (let i = 0; i < this.hashCount; i++) {
         const index = BloomFilter.generateIndex(startingIndex, offset, i, this.field.length)
         if (this.field.get(index) === 0) {
            return false
         }
      }
      return true
   }

   static optimalHashCount(bitArrayLength: number, itemCount: number, errorRate = 0.01) {

   }
}
