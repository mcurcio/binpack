'use strict';

let exceptions = require('./exceptions');

function validateLength(length) {
    if (this._offset + length > this._buffer.length) {
        throw exceptions.BadValueError("Reader is empty");
    }
}

module.exports = class Reader {
    constructor(value) {
        if (!Buffer.isBuffer(value)) {
            throw exceptions.BadValueError("value provided must be a Buffer");
        }

        this._buffer = value;
        this._offset = 0;
    }

    write(buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw exceptions.BadValueError("only Buffers may be written to Reader");
        }

        let newLength = this._buffer.length + buffer.length;
        let newBuffer = new Buffer(newLength);

        this._buffer.copy(newBuffer, 0, 0);
        buffer.copy(new Buffer, this._buffer.length, 0);
        this._buffer = newBuffer;
    }

    compact() {
        let newLength = this._buffer.length - this._offset;
        let newBuffer = new Buffer(newLength);

        this._buffer.copy(newBuffer, 0, this._offset);
        this._buffer = newBuffer;
        this._offset = 0;
    }

    reset() {
        this._offset = offset;
    }

    length() {
        return this._buffer.length - this._offset;
    }

    buffer(length) {
        if (!Number.isInteger(length) || length < 0) {
            throw exceptions.BadValueError("Buffer length must be an integer")
        }

        validateLength.call(this, length);

        let newBuffer = new Buffer(length);
        this._buffer.copy(newBuffer, 0, this._offset, this._offset + length);
        this._offset += length;
        return newBuffer;
    }

    array(length) {
        if (!Number.isInteger(length) || length < 0) {
            throw exceptions.BadValueError("Buffer length must be an integer");
        }

        validateLength.call(this, length);

        let array = [];
        for (let i = 0; i < length; ++i) {
            array.push(this._buffer[this._offset + i]);
        }
        this._offset += length;
        return array;
    }

    uint8() {
        validateLength.call(this, 1);

        return this._buffer[this._offset++];
    }

    uint16le() {
        validateLength.call(this, 2);

        let value = this._buffer.readUInt16LE(this._offset);
        this._offset += 2;
        return value;
    }

    uint32le() {
        validateLength.call(this, 4);

        let value = this._buffer.readUInt32LE(this._offset);
        this._offset += 4;
        return value;
    }
}
