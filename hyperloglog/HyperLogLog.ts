import { getDistanceToNext1, getNSignificantBits } from "./utils"
import { getSmallestXPercent, harmonicMean } from "../utils"


export default class HyperLogLog {
   private readonly hashFunction: (string) => Buffer
   /**
    * contains the largest leading zeros seen for each bucket
    */
   public buckets: number[]
   /**
    * number of most significant bits used to partition the hash into buckets. This will result in
    * 2^n buckets
    * @private
    */
   private readonly bucketBits: number
   private readonly hashBitLength: number
   private readonly standardCorrectionFactor: number

   /**
    * @param bucketBits also referred to as the register size in the paper. should be at least 4 or else we cant
    * generate the correction factor properly. More importantly, we are trying to reduce variance by increasing the
    * number of buckets and too few bits allocated will result in low buckets, which will result in a high variance.
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
      this.standardCorrectionFactor = HyperLogLog.getCorrectionFactor(bucketBits)
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

   /**
    * There are two main correcting factors, depending firstly on whether there are any buckets with 0 counts
    * registered inside. If there are, then the estimate is corrected using the linear counting method.
    *
    * If there are no buckets with 0 counts, then we move onto the standard correcting factor. These are dependent
    * on how many buckets we have (which is itself dependent on how many bits we decided to leave for the bucket partitioning).
    */
   getEstimate() {
      const zeroBucketCount = this.getZeroBucketCount()
      if (zeroBucketCount > 0) return HyperLogLog.getLinearCountingEstimate(zeroBucketCount, this.buckets.length)

      const smallest70Percent = getSmallestXPercent(this.buckets, 0.7)
      const hMean = harmonicMean(smallest70Percent)
      const correctionFactor = this.standardCorrectionFactor
      const estimate = correctionFactor * Math.pow(2, this.bucketBits) * Math.pow(2, hMean)
      return estimate
   }

   getLargestBucket() {
      return Math.max(...this.buckets)
   }

   getError() {
      return (1.04 / Math.sqrt(Math.pow(2, this.bucketBits)))
   }

   getZeroBucketCount() {
      let zeroCount = 0
      for (const count of this.buckets) {
         if (count === 0) zeroCount++
      }
      return zeroCount
   }

   /**
    * we skip the loglog method entirely if there aren't that many numbers that were added to the estimator. We can
    * use a linear counting method to estimate the cardinality which we use if there are any buckets that have 0
    * counts
    * @param zeroCount
    * @param bucketCount
    */
   static getLinearCountingEstimate(zeroCount, bucketCount) {
      return bucketCount * Math.log(bucketCount / zeroCount)
   }

   /**
    * static correction factor (phis in original paper) for a given number of buckets are pre-calculated
    * for some small numbers of n but we have a generalized formula for larger sizes
    * @param bucketBits
    */
   static getCorrectionFactor(bucketBits) {
      switch (bucketBits) {
         case 4:
            return 0.673
         case 5:
            return 0.697
         case 6:
            return 0.709
         default:
            return 0.7213 / (1 + 1.079 / Math.pow(2, bucketBits))
      }
   }

   /**
    * Merges another instance of HyperLogLog into this one. The way we do this is to only keep the
    * largest bucket value for each bucket.
    *
    * @param other
    */
   merge(other: HyperLogLog) {
      if (this.bucketBits !== other.bucketBits) {
         throw new Error("Cannot merge two instances with different bucket sizes")
      }
      for (let i = 0; i < this.buckets.length; i++) {
         this.buckets[i] = Math.max(this.buckets[i], other.buckets[i])
      }
   }
}
