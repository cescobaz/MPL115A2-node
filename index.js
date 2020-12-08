'use strict'

const { MPL115A2 } = require('src/mpl115a2.js')

const mpl115a2 = new MPL115A2()
mpl115a2.init()
  .then(mpl115a2.convert)
  .then(mpl115a2.read)
  .then(console.log)
