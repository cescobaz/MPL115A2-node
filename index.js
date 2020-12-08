'use strict'

const i2c = require('i2c-bus')

// mpl115a2 spec http://www.farnell.com/datasheets/1853286.pdf
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

function makeFraction(raw, fractionSize) {
  const negative = !!(raw & 0x8000)
  if (negative) {
    raw = (~raw) + 1
  }
  const intPart = raw >> fractionSize
  console.log('intpart', intPart)
  let fractionMask = 0x0001
  for (let i = 1; i < fractionSize; ++i) {
    fractionMask = (fractionMask << 1) | 0x0001
  }
  console.log('fractionMask', fractionMask)
  const fractionPart = (raw & fractionMask)
  console.log('fractionPart', fractionPart)
  const sign = negative ? '-' : ''
  return parseFloat(`${sign}${intPart}.${fractionPart}`)
}

async function read() {
  const i2c1 = await i2c.openPromisified(1)
  const padcMSB = await i2c1.readByte(deviceAddress, padcMSBAddress)
  const padcLSB = await i2c1.readByte(deviceAddress, padcLSBAddress)
  const tadcMSB = await i2c1.readByte(deviceAddress, tadcMSBAddress)
  const tadcLSB = await i2c1.readByte(deviceAddress, tadcLSBAddress)
  const a0MSB = await i2c1.readByte(deviceAddress, a0MSBAddress)
  const a0LSB = await i2c1.readByte(deviceAddress, a0LSBAddress)
  const b1MSB = await i2c1.readByte(deviceAddress, b1MSBAddress)
  const b1LSB = await i2c1.readByte(deviceAddress, b1LSBAddress)
  const b2MSB = await i2c1.readByte(deviceAddress, b2MSBAddress)
  const b2LSB = await i2c1.readByte(deviceAddress, b2LSBAddress)
  const c12MSB = await i2c1.readByte(deviceAddress, c12MSBAddress)
  const c12LSB = await i2c1.readByte(deviceAddress, c12LSBAddress)
  
  const padc = (padcMSB << 2) | (padcLSB & 0x0003)
  const tadc = (tadcMSB << 2) | (tadcLSB & 0x0003)
  console.log('tadc', tadc)
  const a0 = makeFraction((a0MSB << 8) | (a0LSB & 0x00FF), 3)
  console.log('a0', a0)
  const b1 = makeFraction((b1MSB << 8) | (b1LSB & 0x00FF), 13)
  console.log('b1', b1)
  const b2 = makeFraction((b2MSB << 2) | (b2LSB & 0x0003), 14)
  console.log('b2', b2)
  const c12 = makeFraction((c12MSB << 2) | (c12LSB & 0x0003), 13)
  console.log('c12', c12)
  
  await i2c1.close()
}

read()
