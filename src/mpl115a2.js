'use strict'

const i2c = require('i2c-bus')

// mpl115a2 spec
// https://www.nxp.com/docs/en/data-sheet/MPL115A2.pdf
// http://www.farnell.com/datasheets/1853286.pdf

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

function MPL115A2 () {

}

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
  console.log('a0', this.a0)
  this.b1 = makeFraction(b1MSB, b1LSB, 13)
  console.log('b1', this.b1)
  this.b2 = makeFraction(b2MSB, b2LSB, 14)
  console.log('b2', this.b2)
  this.c12 = makeFraction(c12MSB, c12LSB, 13 + 9, 2)
  console.log('c12', this.c12)

  await i2c1.close()
}

MPL115A2.prototype.convert = function () {
  return i2c.openPromisified(1)
    .then(i2c1 => i2c1.writeByte(deviceAddress, convertAddress, 0x01))
    .then(() => new Promise(resolve => setTimeout(resolve, 100)))
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

  const padc = ((padcMSB << 8) | (padcLSB & 0x00C0)) >>> 6
  console.log('padc', padc)
  const tadc = ((tadcMSB << 8) | (tadcLSB & 0x00C0)) >>> 6
  console.log('tadc', tadc)

  await i2c1.close()

  const pcomp = this.a0 + (this.b1 + this.c12 * tadc) * padc + this.b2 * tadc
  console.log('pcomp', pcomp)
  const pressureValue = pcomp * ((115 - 50) / 1023) + 50
  const now = new Date()
  const pressure = { date: now, unit: 'kPa', value: pressureValue }
  this.pressure = pressure

  const temperatureCelsius = (tadc - 414) / 4
  const temperature = { date: now, unit: 'celsius', value: temperatureCelsius }
  this.temperature = temperature
  return { pressure, temperature }
}

function makeFraction (msb, lsb, fractionSize, extraValueRShift = 0) {
  let raw = (msb << 8) | (lsb & 0x00FF)
  const negative = (raw & 0x8000) !== 0
  if (negative) {
    raw = ((~raw) + 0x0001) & (0xFFFF)
  }
  if (extraValueRShift > 0) {
    raw >>= extraValueRShift
  }
  let fractionMask = 0x0001
  let fractionPart = 0
  for (let i = fractionSize; i > 0; --i) {
    fractionPart += (raw & fractionMask) !== 0 ? (1.0 / Math.pow(2, i)) : 0
    fractionMask <<= 1
  }
  const intPart = (raw >> fractionSize)
  const sign = negative ? (-1) : 1
  return sign * (intPart + fractionPart)
}

module.exports = { makeFraction, MPL115A2 }
