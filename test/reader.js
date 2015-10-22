'use strict';

let binpack = require('..')
let Reader = binpack.Reader;

let Stream = require('stream').PassThrough;

describe('Reader', () => {
    describe('interface', () => {
        it('constructor', () => {
            let reader = new Reader;
            reader = new Reader(new Buffer(0));
            reader = new Reader([]);
        });

        it('length', () => {
            let reader = new Reader([]);
            reader.length().should.equal(0);

            reader = new Reader(new Array(4));
            reader.length().should.equal(4);

            reader = new Reader(new Array(500));
            reader.length().should.equal(500);

            reader.buffer(100);

            reader.length().should.equal(500);
        });

        it('remaining', () => {
            let reader = new Reader(new Array(40));

            reader.remaining().should.equal(40);

            reader.buffer(5);
            reader.uint8();
            reader.float32be();

            reader.remaining().should.equal(30);
        });

        it('compact', () => {
            let reader = new Reader(new Array(40));

            reader.length().should.equal(40);
            reader.remaining().should.equal(40);

            reader.array(10);

            reader.length().should.equal(40);
            reader.remaining().should.equal(30);

            reader.compact();

            reader.length().should.equal(30);
            reader.remaining().should.equal(30);
        });

        it('reset', () => {
            let reader = new Reader([0x01, 0x02, 0x03]);

            reader.uint8().should.equal(0x01);
            reader.uint8().should.equal(0x02);

            reader.length().should.equal(3);
            reader.remaining().should.equal(1);

            reader.reset().should.equal(reader);

            reader.length().should.equal(3);
            reader.remaining().should.equal(3);

            reader.uint8().should.equal(0x01);
            reader.uint8().should.equal(0x02);

            reader.reset(1);

            reader.length().should.equal(3);
            reader.remaining().should.equal(2);

            reader.uint8().should.equal(0x02);
            reader.uint8().should.equal(0x03);
        });

        it('write', () => {
            let reader = new Reader(3);

            reader.length().should.equal(0);
            reader.remaining().should.equal(0);

            reader.write(new Buffer([0x01, 0x02])).should.be.true;

            reader.length().should.equal(2);
            reader.remaining().should.equal(2);

            reader.uint8().should.equal(0x01);
            reader.compact();
            reader.length().should.equal(1);

            reader.write(new Buffer([0x03, 0x04, 0x05]));
            reader.length().should.equal(3);
            reader.remaining().should.equal(3);

            reader.uint16be().should.equal(0x0203);
            (() => reader.uint16le()).should.throw(RangeError);

            reader.compact();
            reader.uint16le().should.equal(0x0504);

            reader.remaining().should.equal(0);
        });

        it('stream', () => {
            let reader = new Reader(1);
            let stream = new Stream();

            stream.pipe(reader);

            reader.remaining().should.equal(0);

            stream.write(new Buffer([0x01, 0x03, 0x05, 0x07]));
            reader.remaining().should.equal(1);
            reader.uint8().should.equal(0x01);
            reader.compact();
            reader.uint8().should.equal(0x03);
            (() => reader.uint8()).should.throw(RangeError)
            reader.compact();
            reader.uint8().should.equal(0x05);
        });
    });

    describe('types', () => {
        it('array', () => {
            let reader = new Reader([0x01, 0x02, 0x03, 7, 255]);

            reader.array(2).should.deep.equal([0x01, 0x02]);

            reader.length().should.equal(5);
            reader.remaining().should.equal(3);

            reader.array(2).should.deep.equal([0x03, 7]);

            reader.length().should.equal(5);
            reader.remaining().should.equal(1);

            (() => reader.array(2)).should.throw(RangeError);

            reader.length().should.equal(5);
            reader.remaining().should.equal(1);

            reader.compact();

            reader.length().should.equal(1);
            reader.remaining().should.equal(1);

            reader.array(1).should.deep.equal([255]);

            reader.length().should.equal(1);
            reader.remaining().should.equal(0);
        });

        it('buffer', () => {
            let reader = new Reader(new Buffer([0x01, 0x02, 0x03]));

            reader.length().should.equal(3);
            reader.remaining().should.equal(3);

            reader.buffer(2).equals(new Buffer([0x01, 0x02]));

            reader.length().should.equal(3);
            reader.remaining().should.equal(1);

            reader.compact();

            reader.length().should.equal(1);
            reader.remaining().should.equal(1);

            (() => reader.buffer(2)).should.throw(RangeError);

            reader.buffer(1).should.deep.equal(new Buffer([0x03]));
        });

        it('string', () => {
            let reader = new Reader(new Buffer("Hello, World!"));

            reader.string(13).should.equal("Hello, World!");
            (() => reader.string(1)).should.throw(RangeError);

            reader.reset();

            reader.string(6).should.equal("Hello,");
            reader.string(6).should.equal(" World");
            reader.string(1).should.equal("!");
        });

        it('uint8', () => {
            let reader = new Reader(new Buffer([0x01, 0x02, 0x03]));

            reader.uint8().should.equal(1);
            reader.uint8().should.equal(2);
            reader.uint8().should.equal(3);
            (() => reader.uint8()).should.throw(RangeError);
        });

        it('int8', () => {
            let reader = new Reader(new Buffer([0x01, -2, 0x03]));

            reader.int8().should.equal(1);
            reader.int8().should.equal(-2);
            reader.int8().should.equal(3);
            (() => reader.int8()).should.throw(RangeError);
        });

        it('uint16le', () => {
            let reader = new Reader([0x01, 0x02, 0x03]);

            reader.uint16le().should.equal(0x0201);
            (() => reader.uint16le()).should.throw(RangeError);
            reader.uint8().should.equal(0x03);
        });

        it('int16le', () => {
            let reader = new Reader([0x18, 0xfc, 0x03]);

            reader.int16le().should.equal(-1000);
            (() => reader.int16le()).should.throw(RangeError);
            reader.uint8().should.equal(0x03);
        });

        it('uint16be', () => {
            let reader = new Reader([0x01, 0x02, 0x03]);

            reader.uint16be().should.equal(0x0102);
            (() => reader.uint16le()).should.throw(RangeError);
            reader.uint8().should.equal(0x03);
        });

        it('int16be', () => {
            let reader = new Reader([0xfc, 0x18, 0x03]);

            reader.int16be().should.equal(-1000);
            (() => reader.uint16le()).should.throw(RangeError);
            reader.uint8().should.equal(0x03);
        });

        it('uint32le', () => {
            let reader = new Reader([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11]);

            reader.uint32le().should.equal(0x04030201);
            reader.uint32le().should.equal(0x08070605);
            (() => reader.uint32le()).should.throw(RangeError);
        });

        it('int32le', () => {
            let reader = new Reader([0x18, 0xfc, 0xff, 0xff, 0xf0, 0xd8, 0xff, 0xff, 0x09, 0x10, 0x11]);

            reader.int32le().should.equal(-1000);
            reader.int32le().should.equal(-10000);
            (() => reader.int32le()).should.throw(RangeError);
        });

        it('uint32be', () => {
            let reader = new Reader([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11]);

            reader.uint32be().should.equal(0x01020304);
            reader.uint32be().should.equal(0x05060708);
            (() => reader.uint32be()).should.throw(RangeError);
        });

        it('int32be', () => {
            let reader = new Reader([0xff, 0xff, 0xfc, 0x18, 0xff, 0xff, 0xd8, 0xf0, 0x09, 0x10, 0x11]);

            reader.int32be().should.equal(-1000);
            reader.int32be().should.equal(-10000);
            (() => reader.int32be()).should.throw(RangeError);
        });

        it('float32le', () => {
            let reader = new Reader([0xdb, 0x0f, 0x49, 0x40]);

            reader.float32le().should.be.closeTo(Math.PI, 0.0000001);
            (() => reader.float32le()).should.throw(RangeError);
        });

        it('float32be', () => {
            let reader = new Reader([0x40, 0x49, 0x0f, 0xdb, 0x0f, 0x49, 0x40]);

            reader.float32be().should.be.closeTo(Math.PI, 0.0000001);
            (() => reader.float32le()).should.throw(RangeError);
        });

        it('float64le', () => {
            let reader = new Reader([0x18, 0x2d, 0x44, 0x54, 0xfb, 0x21, 0x09, 0x40]);

            reader.float64le().should.be.closeTo(Math.PI, 0.0000000000000001);
            (() => reader.float64le()).should.throw(RangeError);
        });

        it('float64be', () => {
            let reader = new Reader([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18]);

            reader.float64be().should.be.closeTo(Math.PI, 0.0000000000000001);
            (() => reader.float64le()).should.throw(RangeError);
        });
    });
})
