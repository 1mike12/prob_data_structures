import {
   bufferToBinaryString,
   getBitAtIndex,
   setBitAtIndex,
} from "./utils"

export default class BloomFilter {
   private readonly buffer: Buffer
   private hashFunction: (value: string) => Buffer

   constructor(hashFunction) {
      this.hashFunction = hashFunction
      const bytes = 32
      this.buffer = Buffer.alloc(bytes, 0)
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
      const hash = this.hashFunction(value)
      for (let byte of hash) {
         setBitAtIndex(this.buffer, byte, 1)
      }
   }

   toString() {
      return bufferToBinaryString(this.buffer)
   }

   contains(value: string) {
      const hash = this.hashFunction(value)
      for (let byte of hash) {
         if (getBitAtIndex(this.buffer, byte) === 0) {
            return false
         }
      }
      return true
   }
}
