# HyperLogLog

This is a not particularly performant implementation of the HyperLogLog algorithm that prioritizes documentation and
ease of reading code over absolute performance. If you need a real HLL implementation, there are better libraries with
native code written in C or C++.

## Usage
You must choose your own hashing function and pass it to the HLL constructor. The hashing function must return a 
Buffer. Good choices are any fast, non cryptographically secure functions that will result in an even distribution, 
like xxhash or murmur

```shell
$ npm install hyperloglog
#you will also need a hash function that can return a Buffer such as xxhash
$ npm install xxhash-addon
```

```javascript
import HyperLogLog from 'hyperloglog';
import { XXHash32 } from "xxhash-addon"

const BITS_FOR_BUCKETS = 4
const hashFunction = (value) => {
   const buffer = Buffer.from(value)
   return XXHash32.hash(buffer)
}

const hll = new HyperLogLog(BITS_FOR_BUCKETS, hashFunction)

for (let i = 0; i < 1000000; i++) {
   hll.add(`${i}`)
}
console.log(hll.getEstimate()) // should print something close to 1000000
```
