# binpack

[![Build Status](https://travis-ci.org/mcurcio/binpack.svg)](https://travis-ci.org/mcurcio/binpack)

Binary packing/unpacking for node.js

## Reader

Reader objects allow for simplified unpacking of binary (buffer) data. data
can be "written" into the Reader, and then read using a variety of typed convenience
methods.

Example:
```js
let reader = new Reader([0x45, 0x23, 56, 127]);
let firstByte = reader.uint8();
let nextShort = reader.uint16le();
```
