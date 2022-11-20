import HyperLogLog from "./HyperLogLog"
import { XXHash64 } from "xxhash-addon"
import { equal, ok, notEqual } from "assert"

function closelyEqual(a: number, b: number, error: number) {
   ok(Math.abs(a - b) < (a * error))
}

describe("HyperLogLog", () => {

   const hashFunction = (value: string) => {
      const buffer = Buffer.from(value)
      return XXHash64.hash(buffer)
   }

   it("should construct properly", () => {
      const h = new HyperLogLog(4, hashFunction)
      equal(h.buckets.length, 16)
   })

   it("should insert", () => {
      const h = new HyperLogLog(4, hashFunction)
      h.insert("hello")
      h.insert("world")
      h.insert("something")
      h.insert("something else")
      const largest = h.getLargestBucket()
      ok(largest > 0)
   })

   it("should have values larger than 1", () => {
      const h = new HyperLogLog(4, hashFunction)
      for (let i = 0; i < 1000; i++) {
         h.insert(`hello${i}`)
      }
      const largest = h.getLargestBucket()
      ok(largest > 2)
   })

   it("should calculate error correctly", () => {
      const errors = {
         4: 0.26,
         5: 0.18384776310850234,
         6: 0.13,
         7: 0.09192388155425117,
         8: 0.065,
         9: 0.04596194077712559,
         10: 0.0325,
         11: 0.022980970388562795,
      }

      for (let i = 4; i <= 11; i++) {
         const h = new HyperLogLog(i, hashFunction)
         const error = h.getError()
         closelyEqual(error, errors[i], 0.0001)
      }
   })

   it("should estimate correctly", () => {
      const h = new HyperLogLog(4, hashFunction)
      const insertions = 1e6
      for (let i = 0; i < 1e6; i++) {
         h.insert(`${i}`)
      }
      const estimate = h.getEstimate()
      const error = h.getError()
      const lowerBound = insertions - (insertions * error)
      const upperBound = insertions + (insertions * error)
      ok(estimate > lowerBound && estimate < upperBound)
   })

   it("should merge two instances", () => {
      const h1 = new HyperLogLog(4, hashFunction)
      h1.buckets = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
      const estimate1 = h1.getEstimate()
      const h2 = new HyperLogLog(4, hashFunction)
      h2.buckets = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1]
      const estimate2 = h2.getEstimate()
      h1.merge(h2)
      const estimate3 = h1.getEstimate()
      equal(h1.buckets[0], 3)
      equal(h1.buckets[15], 2)
      notEqual(estimate1, estimate2)
      notEqual(estimate2, estimate3)

      ok(estimate3 > estimate2)
      ok(estimate2 > estimate1)
   })

   it("the merged estimate should be larger than their individual parts", () => {
      const h1 = new HyperLogLog(4, hashFunction)
      const h2 = new HyperLogLog(4, hashFunction)
      for (let i = 0; i < 1e3; i++) {
         h1.insert(`one:${i}`)
         h2.insert(`two:${i}`)
      }
      const estimate1 = h1.getEstimate()
      const estimate2 = h2.getEstimate()
      h1.merge(h2)
      const estimate3 = h1.getEstimate()

      notEqual(estimate1, estimate2)
      notEqual(estimate2, estimate3)
      ok(estimate3 > estimate2)
      ok(estimate2 > estimate1)
   })

   it("should merge realistically merge two instances with real insertions", () => {
      const h1 = new HyperLogLog(11, hashFunction)
      const h2 = new HyperLogLog(11, hashFunction)
      for (let i = 0; i < 1e5; i++) {
         h1.insert(`first:${i}`)
      }
      for (let i = 0; i < 2e5; i++) {
         h2.insert(`second:${i}`)
      }
      const estimate1 = h1.getEstimate()
      const estimate2 = h2.getEstimate()
      h1.merge(h2)
      const estimate3 = h1.getEstimate()

      const difference = Math.abs(estimate3 - (estimate1 + estimate2))
      const differencePercentage = difference / (estimate1 + estimate2)
      ok(differencePercentage < 0.1)
   })

   it("should generate realistic estimates when instantiated with realistic parameters", () => {
      const h = new HyperLogLog(11, hashFunction)
      for (let i = 0; i < 1e5; i++) {
         h.insert(`${i}`)
      }
      const estimate = h.getEstimate()
      const error = h.getError()
      closelyEqual(estimate, 1e5, 2 * error)
   })
})
