/**
 * open addressing hashmap that uses enhanced double hashing to find open spaces on collisions
 */
export default class HashMap {
   private hashFunction: (value: string) => Buffer
   private array: [string, number][]
   private size: number

   constructor(hashFunction: (value: string) => Buffer, size = 1024) {
      const hashFunctionBufferSize = hashFunction("test").length
      if (hashFunctionBufferSize < 4) {
         throw new Error("hash function must return a buffer of at least 4 bytes")
      }

      this.hashFunction = hashFunction
      this.size = 0
      this.array = new Array(size)
   }

   /**
    * setting uses the double hashing technique in order to find alternate locations along the backing array to
    * store the key/value pairs if any of the i initial locations are already occupied
    * @param key
    * @param value
    */
   set(key: string, value: any) {
      const offset = this.getOffset(key)
      const startingIndex = this.getStartingIndex(key)

      for (let i = 0; i < this.array.length / 4; i++) {
         const index = (startingIndex + offset * i) % this.array.length
         const current = this.array[index]
         if (current === undefined) {
            this.array[index] = [key, value]
            this.size++
            return
         }
      }
      throw new Error("HashMap is full")
   }

   getOffset(key: string) {
      const offsetHash = this.hashFunction(key + "offset")
      const offset = offsetHash.readInt16BE(0)
      return offset
   }

   getStartingIndex(key: string) {
      const hash = this.hashFunction(key)
      return hash.readInt16BE(0) % this.array.length
   }

   get(key: string) {
      const offset = this.getOffset(key)
      const startingIndex = this.getStartingIndex(key)

      for (let i = 0; i < this.array.length / 4; i++) {
         const index = (startingIndex + offset * i) % this.array.length
         const current = this.array[index]
         if (current === undefined) {
            return undefined
         }
         if (current[0] === key) {
            return current[1]
         }
      }
      return undefined
   }

   delete(key: string) {
      const offset = this.getOffset(key)
      const startingIndex = this.getStartingIndex(key)

      for (let i = 0; i < this.array.length / 4; i++) {
         const index = (startingIndex + offset * i) % this.array.length
         const current = this.array[index]
         if (current === undefined) {
            return false
         }
         if (current[0] === key) {
            this.array[index] = undefined
            this.size--
            return true
         }
      }
      return false
   }
}
