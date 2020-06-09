# boblight-js

boblight-js is a client library for boblight.

## Installation

    npm install boblight-js --save

## Example

    const boblib = require('boblight-js')

    const boblightClient = new boblib.BoblightClient()
    await boblightClient.connect('localhost', 19333)
    boblightClient.setColorForAll('red')
