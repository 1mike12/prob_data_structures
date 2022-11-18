import { getDistanceToNext1, getNSignificantBits, getSmallestXPercent, harmonicMean } from "./utils"


export default class HyperLogLog {
   private readonly hashFunction: (string) => Buffer
   /**
    * contains the largest leading zeros seen for each bucket
    */
   public buckets: number[]
   private readonly bucketBits: number
   private hashBitLength: number

   /**
    * @param bucketBits also referred to as the register size in the paper. should be at least 4 or else we cant generate the correction factor properly. More importantly, we are trying to reduce variance by increasing the number of buckets and too few bits allocated will result in low buckets, which will result in a high variance.
    *
    * @param hashFunction should be fast, non-cryptographically secure hash function
    */
   constructor(bucketBits: number, hashFunction: (string: string) => Buffer) {
      if (bucketBits < 4 || bucketBits > 64) {
         throw new Error("bucketBits must be between 4 and 64")
      }
      if (!hashFunction || typeof hashFunction !== "function") {
         throw new Error("hashFunction must be provided")
      }

      this.hashFunction = hashFunction
      this.hashBitLength = this.hashFunction("test").byteLength * 8
      this.bucketBits = bucketBits
      const bucketCount = Math.pow(2, bucketBits)
      this.buckets = new Array(bucketCount).fill(0)
   }

   insert(value: string) {
      const hash = this.hashFunction(value)
      const bucketIndex = getNSignificantBits(hash, this.bucketBits)
      const distanceToNext1 = getDistanceToNext1(hash, this.bucketBits)
      this.buckets[bucketIndex] = Math.max(this.buckets[bucketIndex], distanceToNext1)
   }

   getEstimate() {
      const smallest70Percent = getSmallestXPercent(this.buckets, 0.7)
      const hMean = harmonicMean(smallest70Percent)
      const correctionFactor = this.getCorrectionFactor()
      const estimate = correctionFactor * Math.pow(2, this.bucketBits) * Math.pow(2, hMean)
      return estimate
   }

   getLargestBucket() {
      return Math.max(...this.buckets)
   }

   getErrorPercent() {
      return (1.04 / Math.sqrt(Math.pow(2, this.bucketBits))) * 100
   }

   getZeroBucketCount() {
      let zeroCount = 0
      for (const count of this.buckets) {
         if (count === 0) zeroCount++
      }
      return zeroCount
   }

   getLinearCountingEstimate() {
      const zeroCount = this.getZeroBucketCount()
      const m = Math.pow(2, this.bucketBits)
      const estimate = m * Math.log(m / zeroCount)
      return estimate
   }

   /**
    * There are two main correcting factors, depending firstly on whether there are any buckets with 0 counts registered inside. If there are, then the estimate is corrected using the linear counting method.
    *
    * If there are no buckets with 0 counts, then we move onto the standard correcting factor. These are dependent on how many buckets we have (which is itself dependent on how many bits we decided to leave for the bucket partitioning).
    */
   getCorrectionFactor() {
      const zeroCount = this.getZeroBucketCount()
      if (zeroCount != 0) return this.getLinearCountingEstimate()

      switch (this.bucketBits) {
         case 4:
            return 0.673
         case 5:
            return 0.697
         case 6:
            return 0.709
         default:
            return 0.7213 / (1 + 1.079 / Math.pow(2, this.bucketBits))
      }
   }
}
