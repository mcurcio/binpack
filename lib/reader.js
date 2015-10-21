'use strict';

function validateLength(length) {
    if (this._offset + length > this._buffer.length) {
        throw new RangeError("Buffer is empty");
    }
}

function readBufferInt(bytes, fn) {
    validateLength.call(this, bytes);
    let value = this._buffer[fn](this._offset, bytes);
    this._offset += bytes;
    return value;
}

function readBufferFloat(bytes, fn) {
    validateLength.call(this, bytes);
    let value = this._buffer[fn](this._offset);
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

module.exports = class Reader {
    constructor(value) {
        if (Array.isArray(value)) {
            value = new Buffer(value);
        }

        if (!Buffer.isBuffer(value)) {
            throw new RangeError("Value must be an Array or Buffer");
        }

        this._buffer = value;
        this._offset = 0;
    }

    write(value) {
        if (Array.isArray(value)) {
            value = new Buffer(value);
        }

        if (!Buffer.isBuffer(value)) {
            throw new RangeError("Value must be an Array or Buffer");
        }

        let newLength = this._buffer.length + value.length;
        let newBuffer = new Buffer(newLength);

        this._buffer.copy(newBuffer, 0, 0);
        value.copy(newBuffer, this._buffer.length, 0);
        this._buffer = newBuffer;
        return this;
    }

    compact() {
        let newLength = this._buffer.length - this._offset;
        let newBuffer = new Buffer(newLength);

        this._buffer.copy(newBuffer, 0, this._offset);
        this._buffer = newBuffer;
        this._offset = 0;
        return this;
    }

    reset(offset) {
        this._offset = offset || 0;
        return this;
    }

    length() {
        return this._buffer.length;
    }

    remaining() {
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
            throw exceptions.BadValueError("Array length must be an integer");
        }

        validateLength.call(this, length);

        let array = new Array(length);
        for (let i = 0; i < length; ++i) {
            array[i] = this._buffer[this._offset + i];
        }
        this._offset += length;

        return array;
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
