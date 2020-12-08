'use strict'

const tap = require('tap')
const { makeFraction } = require('../src/mpl115a2.js')

const a0 = makeFraction(0x3E, 0xCE, 3)
tap.equal(a0, 2009.75)

const b1 = makeFraction(0xB3, 0xF9, 13)
tap.equal(b1, -2.3758544921875)

const b2 = makeFraction(0xC5, 0x17, 14)
tap.equal(b2, -0.92047119140625)

const c12 = makeFraction(0x33, 0xC8, 13 + 9, 2)
tap.equal(c12, 0.0007901191711425781)
