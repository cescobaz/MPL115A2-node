'use strict'

function computePressure ({ date, a0, b1, b2, c12, tadc, padc }) {
  const pcomp = a0 + (b1 + c12 * tadc) * padc + b2 * tadc
  const pressureValue = pcomp * ((115 - 50) / 1023) + 50
  return { date, unit: 'kPa', value: pressureValue }
}

function computeTemperature ({ date, tadc }) {
  const temperatureCelsius = (tadc - 414) / 4
  return { date, unit: 'celsius', value: temperatureCelsius }
}

function makeADC (msb, lsb) {
  return ((msb << 8) | (lsb & 0x00C0)) >>> 6
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

module.exports = { computePressure, computeTemperature, makeADC, makeFraction }
