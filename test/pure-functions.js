'use strict'

const tap = require('tap')
const {
  makeADC,
  makeFraction,
  computePressure,
  computeTemperature
} = require('../src/pure-functions.js')

const a0 = makeFraction(0x3E, 0xCE, 3)
tap.equal(a0, 2009.75)

const b1 = makeFraction(0xB3, 0xF9, 13)
tap.equal(b1, -2.3758544921875)

const b2 = makeFraction(0xC5, 0x17, 14)
tap.equal(b2, -0.92047119140625)

const c12 = makeFraction(0x33, 0xC8, 13 + 9, 2)
tap.equal(c12, 0.0007901191711425781)

const tadc = makeADC(0x7E, 0xC0)
tap.equal(tadc, 507)

const padc = makeADC(0x66, 0x80)
tap.equal(padc, 410)

const pressure = computePressure({ a0, b1, b2, c12, tadc, padc })
tap.equal(pressure.value, 96.58732586242587)

const temperature = computeTemperature({ tadc })
tap.equal(temperature.value, 23.25)
