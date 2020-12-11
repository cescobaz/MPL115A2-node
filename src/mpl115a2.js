'use strict'

const i2c = require('i2c-bus')
const {
  makeADC,
  makeFraction,
  computePressure,
  computeTemperature
} = require('./pure-functions.js')

// mpl115a2 spec
// https://www.nxp.com/docs/en/data-sheet/MPL115A2.pdf

const deviceAddress = 0x60
const convertAddress = 0x12
const padcMSBAddress = 0x00
const padcLSBAddress = 0x01
const tadcMSBAddress = 0x02
const tadcLSBAddress = 0x03
const a0MSBAddress = 0x04
const a0LSBAddress = 0x05
const b1MSBAddress = 0x06
const b1LSBAddress = 0x07
const b2MSBAddress = 0x08
const b2LSBAddress = 0x09
const c12MSBAddress = 0x0A
const c12LSBAddress = 0x0B

function MPL115A2 () {}

MPL115A2.prototype.init = async function () {
  const i2c1 = await i2c.openPromisified(1)
  const a0MSB = await i2c1.readByte(deviceAddress, a0MSBAddress)
  const a0LSB = await i2c1.readByte(deviceAddress, a0LSBAddress)
  const b1MSB = await i2c1.readByte(deviceAddress, b1MSBAddress)
  const b1LSB = await i2c1.readByte(deviceAddress, b1LSBAddress)
  const b2MSB = await i2c1.readByte(deviceAddress, b2MSBAddress)
  const b2LSB = await i2c1.readByte(deviceAddress, b2LSBAddress)
  const c12MSB = await i2c1.readByte(deviceAddress, c12MSBAddress)
  const c12LSB = await i2c1.readByte(deviceAddress, c12LSBAddress)

  this.a0 = makeFraction(a0MSB, a0LSB, 3)
  this.b1 = makeFraction(b1MSB, b1LSB, 13)
  this.b2 = makeFraction(b2MSB, b2LSB, 14)
  this.c12 = makeFraction(c12MSB, c12LSB, 13 + 9, 2)

  await i2c1.close()
}

MPL115A2.prototype.convert = function () {
  const self = this
  return i2c.openPromisified(1)
    .then(i2c1 => i2c1.writeByte(deviceAddress, convertAddress, 0x01))
    .then(() => {
      self.convertDate = new Date()
      return new Promise(resolve => setTimeout(resolve, 100))
    })
}

MPL115A2.prototype.read = async function () {
  if (!this.a0 || !this.b1 || !this.b2 || !this.c12) {
    throw new Error('please, call init() before read()')
  }
  const i2c1 = await i2c.openPromisified(1)
  const padcMSB = await i2c1.readByte(deviceAddress, padcMSBAddress)
  const padcLSB = await i2c1.readByte(deviceAddress, padcLSBAddress)
  const tadcMSB = await i2c1.readByte(deviceAddress, tadcMSBAddress)
  const tadcLSB = await i2c1.readByte(deviceAddress, tadcLSBAddress)

  const padc = makeADC(padcMSB, padcLSB)
  const tadc = makeADC(tadcMSB, tadcLSB)

  this.padc = padc
  this.tadc = tadc

  await i2c1.close()

  const date = this.convertDate
  const pressure = computePressure({
    a0: this.a0,
    b1: this.b1,
    b2: this.b2,
    c12: this.c12,
    tadc,
    padc,
    date
  })
  this.pressure = pressure

  const temperature = computeTemperature({ tadc, date })
  this.temperature = temperature
  return { pressure, temperature }
}

module.exports = MPL115A2
