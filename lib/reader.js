'use strict';

let stream = require('stream');

function noop() {}

function pop() {
    while (this._buffer.length && this._length < this._capacity) {
        this._storage[this._length++] = this._buffer.shift();
    }

    if (this._done !== noop && this._buffer.length === 0) {
        this._done();
        this._done = noop;
    }
}

function validateLength(length) {
    if (this._offset + length > this._length) {
        throw new RangeError("Buffer is empty");
    }
}

function readBufferInt(bytes, fn) {
    validateLength.call(this, bytes);
    let value = this._storage[fn](this._offset, bytes);
    this._offset += bytes;
    return value;
}

function readBufferFloat(bytes, fn) {
    validateLength.call(this, bytes);
    let value = this._storage[fn](this._offset);
    this._offset += bytes;
    return value;
}

function readUintLe(bytes) {
    return readBufferInt.call(this, bytes, 'readUIntLE');
}

function readIntLe(bytes) {
    return readBufferInt.call(this, bytes, 'readIntLE');
}

function readUintBe(bytes) {
    return readBufferInt.call(this, bytes, 'readUIntBE');
}

function readIntBe(bytes) {
    return readBufferInt.call(this, bytes, 'readIntBE');
}

module.exports = class Reader extends stream.Writable {
    constructor(capacity) {
        super()

        if (Array.isArray(capacity)) {
            capacity = new Buffer(capacity);
        }

        if (Buffer.isBuffer(capacity)) {
            this._storage = capacity;
            this._capacity = capacity.length;
            this._length = capacity.length;
        } else {
            this._storage = new Buffer(capacity || 100);
            this._capacity = capacity;
            this._length = 0;
        }

        this._offset = 0;

        this._buffer = [];
        this._done = noop;
    }

    get capacity() {
        return this._capacity;
    }

    _write(chunk, encoding, callback) {
        if (this._done !== noop) {
            callback(new Error("Write is currently in progress"));
            return;
        }

        this._done = callback;
        this._buffer = chunk.toJSON().data;

        pop.call(this);
    }

    compact() {
        let remaining = this.remaining();
        this._storage.copy(this._storage, 0, this._offset, this._length);
        this._length = remaining;
        this._offset = 0;

        pop.call(this);

        return this;
    }

    reset(offset) {
        this._offset = offset || 0;
        return this;
    }

    length() {
        return this._length;
    }

    remaining() {
        return this._length - this._offset;
    }

    buffer(length) {
        if (!Number.isInteger(length) || length < 0) {
            throw new RangeError("Buffer length must be an integer")
        }

        validateLength.call(this, length);

        let newBuffer = new Buffer(length);
        this._storage.copy(newBuffer, 0, this._offset, this._offset + length);
        this._offset += length;
        return newBuffer;
    }

    array(length) {
        if (!Number.isInteger(length) || length < 0) {
            throw new RangeError("Array length must be an integer");
        }

        validateLength.call(this, length);

        let array = new Array(length);
        for (let i = 0; i < length; ++i) {
            array[i] = this._storage[this._offset + i];
        }
        this._offset += length;

        return array;
    }

    string(length) {
        if (!Number.isInteger(length) || length < 0) {
            throw new RangeError("Array length must be an integer");
        }

        validateLength.call(this, length);

        let string = this._storage.toString('ascii', this._offset, this._offset + length)
        this._offset += length;

        return string;
    }

    uint8() {
        return readUintLe.call(this, 1);
    }

    int8() {
        return readIntLe.call(this, 1);
    }

    uint16le() {
        return readUintLe.call(this, 2);
    }

    int16le() {
        return readIntLe.call(this, 2);
    }

    uint16be() {
        return readUintBe.call(this, 2);
    }

    int16be() {
        return readIntBe.call(this, 2);
    }

    uint32le() {
        return readUintLe.call(this, 4);
    }

    int32le() {
        return readIntLe.call(this, 4);
    }

    uint32be() {
        return readUintBe.call(this, 4);
    }

    int32be() {
        return readIntBe.call(this, 4);
    }

    float32le() {
        return readBufferFloat.call(this, 4, 'readFloatLE');
    }

    float32be() {
        return readBufferFloat.call(this, 4, 'readFloatBE');
    }

    float64le() {
        return readBufferFloat.call(this, 8, 'readDoubleLE');
    }

    float64be() {
        return readBufferFloat.call(this, 8, 'readDoubleBE');
    }
}
