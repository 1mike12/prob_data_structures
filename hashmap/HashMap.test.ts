import HashMap from "./HashMap"
import { XXHash32 } from "xxhash-addon"
import { equal } from "assert"

describe("HashMap", () => {
   const hashFunction = (value: string) => {
      return XXHash32.hash(Buffer.from(value))
   }
   it("should insert values without crashing", () => {
      const map = new HashMap(hashFunction, 1024)
      map.set("hello", "world")
      map.set("foo", "bar")
   })

   it("should get inserted values", () => {
      const map = new HashMap(hashFunction, 1024)
      map.set("hello", "world")
      equal(map.get("hello"), "world")
   })

   it("should return undefined for non-existent values", () => {
      const map = new HashMap(hashFunction, 1024)
      equal(map.get("hello"), undefined)
   })

   it("should delete values", () => {
      const map = new HashMap(hashFunction, 1024)
      map.set("hello", "world")
      map.delete("hello")
      equal(map.get("hello"), undefined)
   })
})
