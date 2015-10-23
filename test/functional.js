'use strict';

let binpack = require('..');
let Reader = binpack.Reader;
let Writer = binpack.Writer;

let Stream = require('stream').PassThrough;

function roundtrip(fn, value) {
    let writer = new Writer;

    writer[fn](value);

    let reader = new Reader(writer.read());

    reader[fn]().should.deep.equal(value);
}

function roundtripLength(fn, value) {
    let writer = new Writer;

    writer[fn](value);

    let reader = new Reader(writer.read());

    reader[fn](value.length).should.deep.equal(value);
}

function roundtripFloat(fn, value, err) {
    let writer = new Writer;

    writer[fn](value);

    let reader = new Reader(writer.read());

    reader[fn]().should.be.closeTo(value, err);
}

describe('Functional', () => {
    it('buffer', () => roundtripLength('buffer', new Buffer([1,2,3,4,5,6])));

    it('array', () => roundtripLength('array', [1,2,3,4,5,6,7,8,9]));

    it('string', () => roundtripLength('string', "Hello, World!"));

    it('uint8', () => roundtrip('uint8', 13));

    it('int8', () => roundtrip('int8', -27));

    it('uint16le', () => roundtrip('uint16le', 0x1234));

    it('int16le', () => roundtrip('int16le', 0x1234));

    it('uint16be', () => roundtrip('uint16be', 0x1234));

    it('int16be', () => roundtrip('int16be', 0x1234));

    it('uint32le', () => roundtrip('uint32le', 0x12345678));

    it('int32le', () => roundtrip('int32le', 0x12345678));

    it('uint32be', () => roundtrip('uint32be', 0x12345678));

    it('int32be', () => roundtrip('int32be', 0x12345678));

    it('float32le', () => roundtripFloat('float32le', Math.PI, 0.0000001));

    it('float32be', () => roundtripFloat('float32be', Math.PI, 0.0000001));

    it('float64le', () => roundtrip('float64le', Math.PI, 0.0000000000000001));

    it('float64be', () => roundtrip('float64be', Math.PI, 0.0000000000000001));
});
