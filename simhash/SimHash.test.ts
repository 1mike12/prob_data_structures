import { XXHash64 } from "xxhash-addon"
import SimHash from "./SimHash"
import { equal, ok } from "assert"

describe("SimHash", () => {
   const hashFunction = (value: string) => {
      const buffer = Buffer.from(value)
      return XXHash64.hash(buffer)
   }

   it("should get vector of text", () => {
      const simHash = new SimHash(hashFunction, 64)
      const vector = simHash.getVector("hello world")
      const vector2 = simHash.getVector("hello world")
      equal(vector.length, 8)
      ok(vector.equals(vector2))
   })

   it('should get different vectors for different text', () => {
      const simHash = new SimHash(hashFunction, 64)
      const vector = simHash.getVector("hello world")
      const vector2 = simHash.getVector("hello world 2")
      ok(!vector.equals(vector2))
   })

   it('should get same vectors for similar text', () => {
      const simHash = new SimHash(hashFunction, 64)
      const longText1 = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      const longText2 = "DIFFERENT ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" +
         " incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      const vector = simHash.getVector(longText1)
      const vector2 = simHash.getVector(longText2)
      ok(vector.equals(vector2))
   })

})
