'use strict';

let stream = require('stream');

function writeUintLe(number, size) {
    let buffer = new Buffer(size);
    buffer.writeUIntLE(number, 0, size);
    return this.buffer(buffer);
}

function writeUintBe(number, size) {
    let buffer = new Buffer(size);
    buffer.writeUIntBE(number, 0, size);
    return this.buffer(buffer);
}

function writeIntLe(number, size) {
    let buffer = new Buffer(size);
    buffer.writeIntLE(number, 0, size);
    return this.buffer(buffer);
}

function writeIntBe(number, size) {
    let buffer = new Buffer(size);
    buffer.writeIntBE(number, 0, size);
    return this.buffer(buffer);
}

function writeBufferFloat(number, size, fn) {
    let buffer = new Buffer(size);
    buffer[fn](number);
    return this.buffer(buffer);
}

module.exports = class Writer extends stream.Readable {
    constructor(capacity) {
        super()

        capacity = capacity || 1024;

        this._storage = new Buffer(capacity);

        this._capacity = capacity;
        this._length = 0;
    }

    _read(size) {
        this.push(this._storage.slice(0, this._length));
        this._length = 0;
    }

    buffer(buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError("Argument must be a Buffer");
        }

        if (this._length + buffer.length > this._storage.length) {
            throw new RangeError("Writer is full");
        }

        buffer.copy(this._storage, this._length, 0);
        this._length += buffer.length;
    }

    array(array) {
        return this.buffer(new Buffer(array));
    }

    string(string) {
        return this.buffer(new Buffer(string));
    }

    uint8(number) {
        return writeUintLe.call(this, number, 1);
    }

    int8(number) {
        return writeIntLe.call(this, number, 1);
    }

    uint16le(number) {
        return writeUintLe.call(this, number, 2);
    }

    int16le(number) {
        return writeIntLe.call(this, number, 2);
    }

    uint16be(number) {
        return writeUintBe.call(this, number, 2);
    }

    int16be(number) {
        return writeIntBe.call(this, number, 2);
    }

    uint32le(number) {
        return writeUintLe.call(this, number, 4);
    }

    int32le(number) {
        return writeIntLe.call(this, number, 4);
    }

    uint32be(number) {
        return writeUintBe.call(this, number, 4);
    }

    int32be(number) {
        return writeIntBe.call(this, number, 4);
    }

    float32le(number) {
        return writeBufferFloat.call(this, number, 4, 'writeFloatLE');
    }

    float32be(number) {
        return writeBufferFloat.call(this, number, 4, 'writeFloatBE');
    }

    float64le(number) {
        return writeBufferFloat.call(this, number, 8, 'writeDoubleLE');
    }

    float64be(number) {
        return writeBufferFloat.call(this, number, 8, 'writeDoubleBE');
    }
};
