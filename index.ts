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

   /**
    * Given the string value, generate the indices that should be set to 1 in our bitfield
    *
    *  we do this by the "double hashing" method. We first generate two numbers from the same hash function
    *  The first number will be used as the starting index, while the second will be an offset that we can use to
    *  generate i number of next indices by a formula of the form index_i = startingIndex + offset * i
    *
    * @param value
    */
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
    * @param value
    */
   insert(value: string) {
      const indices = this.indicesForValue(value)
      for (let index of indices) {
         this.field.set(index, 1)
      }
   }

   contains(value: string) {
      const indices = this.indicesForValue(value)
      for (let index of indices) {
         if (this.field.get(index) === 0) {
            return false
         }
      }
      return true
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
      const numerator = i * (i ** 2 - 1)
      const index = (first + numerator / 6) % bitFieldLength
      return index
   }

   toString() {
      return this.field.toString()
   }

   /**
    * generate two hashes in order to do "enhanced double hashing"
    * the first hash will be used as the starting index
    * the second hash will be used as the offset
    *
    * @param value
    * @returns [startingIndex, offset]
    */
   getStartAndOffsetForValue(value: string): [number, number] {
      const hash = this.hashFunction(value)
      const startingIndex = hash.readUInt16BE(0) % this.field.length
      const offset = hash.readUInt16BE(2) % this.field.length
      return [startingIndex, offset]
   }

   static optimalHashCount(bitArrayLength: number, itemCount: number) {
      const k = (bitArrayLength / itemCount) * Math.log(2)
      return Math.round(k)
   }

   /**
    * get the false positive rate
    *
    *  (1 - e^(-k * n / m)) ^ k
    *
    *  where k is the number of hash functions
    *  m is the number of bits we are hashing into
    *  n is the number of items we are inserting (i think)
    *
    *  as n ↑ e↓, therefor error ↑
    *  as m ↑ e↑, therefor error ↓
    *  as k ↑ the stuff in paranthenses will be exponentiated and made smaller, therefor error ↓
    */
   getErrorRate() {
      return Math.pow(1 - Math.exp(-this.hashCount * this.field.oneCount / this.field.length), this.hashCount)
   }
}
