# MPL115A2-node

## Usage

See `examples` folder.

```javascript
const MPL115A2 = require('mpl115a2-i2c')

const mpl115a2 = new MPL115A2()
mpl115a2.init()
  .then(mpl114a2.convert.bind(mpl115a2))
  .then(mpl115a2.read.bind(mpl115a2))
  .then(console.log)
  .catch(console.log)
```

### init()

You must call `init` before using the object. This function will read constant values of the devices.

Returns a Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.

### convert()

`convert` will ask to the device to read new values from sensors.

Returns a Promise that will be resolved with no arguments on success, or will be rejected if an error occurs.

### read()

`read` will read pressure and temperature values from sensors registers.

Returns a Promise that will be resolved with the following object on success, or will be rejected if an error occurs.

```js
{
  pressure: {
    date: 2020-12-08T23:07:26.480Z,
    unit: 'kPa',
    value: 98.32094899020936
  },
  temperature: {
    date: 2020-12-08T23:07:26.480Z,
    unit: 'celsius',
    value: 27.75
  }
}
```
