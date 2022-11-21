import BitField from "../BitField"
import * as Buffer from "buffer"

/**
 * Simhash generates identical hashes for similar strings. It's a form of locality-sensitive hashing (LHR) that is
 * able to bring the dimensionality of a dataset down to very small vectors.
 */
export default class SimHash {
   private hashFunction: (value: string) => Buffer
   private vectorLength: number

   constructor(hashFunction: (value: string) => Buffer, vectorLength = 64) {
      this.hashFunction = hashFunction
      this.vectorLength = vectorLength
   }

   getVector(text: string): Buffer {
      const tokens = SimHash.tokenize(text)
      let token_count: { [token: string]: number } = {}

      const rawVector = new Array(this.vectorLength).fill(0)
      for (let token of tokens) {
         token_count[token] = (token_count[token] || 0) + 1
      }

      for (let [token, count] of Object.entries(token_count)) {
         const hash = this.hashFunction(token)
         const field = BitField.from(hash)
         for (let i = 0; i < rawVector.length; i++) {
            rawVector[i] += field.get(i) * count
         }
      }

      const vector = new BitField(this.vectorLength)
      for (let i = 0; i < rawVector.length; i++) {
         vector.set(i, rawVector[i] > 0 ? 1 : 0)
      }
      return vector.getBuffer()
   }

   static tokenize(text: string) {
      text = text.toLowerCase()
      //remove punctuation and split on whitespace
      return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(" ")
   }
}
