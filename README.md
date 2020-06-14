# boblight-js

![Node.js CI](https://github.com/scic/boblight-js/workflows/Node.js%20CI/badge.svg)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

boblight-js is a client library for boblight.

## Requirements

Node.js >= 12

## Installation

    npm install boblight-js --save

## Example

    const boblib = require('boblight-js')

    const boblightClient = new boblib.BoblightClient()
    await boblightClient.connect('localhost', 19333)

    boblightClient.setColorForAll(boblib.Colors.red)
    boblightClient.sleep()
    boblightClient.setColorForAll(new boblib.Color(0, 0, 1))

## API

### BoblightClient

Connects to the server at host with port and priority:

    connect(host = 'localhost', port = 19333, priority = 128)

Get all lights:

    getLights()

Sets the color for all lights:

    setColorForAll(color = new Color(0, 0, 0))

Sets the color of the specified light:

    setColor(light, color = new Color(0, 0, 0))

Sets the transitioning speed of the specified light:

    setSpeed(light, speed = 1)

Sets the priority of this boblight client:

    setPriority(prioritiy = 128)

Checks if the boblight server answers:

    ping()

Reconnects to the boblight server:

    reconnect()

Sleep for msSeconds:

    async sleep(msSeconds = 1000)

### Color

Creates a color: red, green, blue must be a value between 0 and 1

    new Color(red = 0, green = 0, blue = 0):
