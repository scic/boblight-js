const net = require("net")
const readline = require('readline')

class Light {
  constructor(name, color = new Color()) {
    this.name = name
    this.color = color
  }
}

class Color {
  constructor(red=0, green=0, blue=0) {
    this.red = red
    this.green = green
    this.blue = blue
  }
}

const COLORS = {
  'red': new Color(1, 0, 0),
  'green': new Color(0, 1, 0),
  'blue': new Color(0, 0, 1),
  'yellow': new Color(1, 1, 0),
  'teal': new Color(0, 1, 1),
  'magenta': new Color(1, 0, 1),
  'orange': new Color(0.878, 0.415, 0),
  'white': new Color(1, 1, 1),
  'off': new Color(0, 0, 0)
}

class BoblightClient {
  
  #connector = new Connector()
  
  async connect(host = "localhost", port = 19333, priority = 128) {
    await this.#connector.connect(host, port, priority)
  }
  
  getLights() {
    return this.#connector.getLights()
  }
  
  async refreshLights() {
    // TODO
  }
  
  setColorForAll(color = new Color(0, 0, 0)) {
    this.getLights().forEach(light => this.#connector.setColor(light, color))
    this.sync()
  }
  
  setColor(light, color = new Color(0, 0, 0)) {
    this.#connector.setColor(light, color)
    this.sync()
  }
  
  setSpeed(light, speed = 1) {
    this.#connector.setSpeed(light, speed)
  }
  
  setInterpolation(light, interpolation = 1) {
    this.#connector.setInterpolation(light, interpolation)
  }
  
  setPriority(prioritiy = 128) {
    this.#connector.setPrioritiy(priority)
  }
  
  sync() {
    this.#connector.sync()
  }
  
  ping() {
    this.#connector.ping()
  }
  
  reconnect() {
    this.#connector.reconnect()
  }
  
  async sleep(msSeconds = 1000) {
    await new Promise(r => setTimeout(r, msSeconds));
  }
}
    
class Connector {
  
  #host
  #port
  #priority
  
  #client
  #lineReader
  #lights = []

  async connect(host, port, priority) {
    this.#host = host
    this.#port = port
    this.#priority = priority
    
    return new Promise((resolve, reject) => {
      this.#client = new net.Socket()
            
      const socket = this.#client.connect(port, host, async () => {
        console.log('Connected to Boblightserver. Saying hello...')
        const res = await this.send('hello')
        if (res === 'hello') {
          const version = await this.send('get version')
          this.#lights = await this.send('get lights', this.readLights)
          this.sendCommand(`set priority ${priority}`)
          resolve();
        }
      })
      this.#lineReader = readline.createInterface({
        input: socket
      })
      
      this.#client.on('error', function(error) {
        console.log('Error', error)
      })
      
      this.#client.on('drain', function() {
        console.log('drain')
        this.#client.resume();
      })
      
      this.#client.on('timeout',function(){
        console.log('Socket timed out !');
        this.#client.end('Timed out!');
      });
      
      this.#client.on('close', function(info) {
        console.log('closed', info)
      })
      
      this.#client.on('end', function() {
        console.log('disconnected from server')
      })
    })
  }
  
  async reconnect() {
    if (this.#client.isdestroyed) {
      this.#client.destroy()
    } else {
      this.#client.end()
    }
    this.connect(this.#host, this.#port, this.#priority)
  }
  
  async readOne(resolve) {
    this.#lineReader.once('line', (line) => {
      console.log('server said', line)
      return resolve(line)
    })
  }
  
  async readLights(resolve) {
    var lights
    var numberOfLights
    this.#lineReader.on('line', (line) => {
      console.log('server said:', line)
      
      if (line.startsWith('lights')) {
        numberOfLights = +line.split(' ')[1];
        lights = [];
      }
      
      if (line.startsWith('light ')) {
        const name = line.split(' ')[1];
        lights.push(new Light(name));
        
        if (lights.length === numberOfLights) {
          this.#lineReader.removeAllListeners('line')
          resolve(lights)
        }
      }
    })
  }
  
  async send(command, reader = this.readOne) {
    return new Promise((resolve, reject) => {
      reader.call(this, resolve)
      this.#client.write(command + '\n')
    });
  }
  
  sendCommand(command) {
    this.#client.write(command + '\n')
  }
        
  getLights() {
    return [...this.#lights]
  }
  
  setColor(light, color) {
    if(color.red < 0 || color.red > 1) {
      throw new Error(`Color red must be between 0 and 1 but was ${color.red}`)
    }
    if(color.green < 0 || color.green > 1) {
      throw new Error(`Color green must be between 0 and 1 but was ${color.green}`)
    }
    if(color.blue < 0 || color.blue > 1) {
      throw new Error(`Color blue must be between 0 and 1 but was ${color.blue}`)
    }
    this.sendCommand(`set light ${light.name} rgb ${color.red} ${color.green} ${color.blue}`)
  }
  
  setSpeed(light, speed = 1) {
    if(speed < 0 || speed > 1) {
      throw new Error(`Speed must be between 0 and 1 but was ${speed}`)
    }
    this.sendCommand(`set light ${light.name} speed ${speed}`)
  }
  
  setInterpolation(light, interpolation = 0) {
    if(interpolation < 0 || interpolation > 1) {
      throw new Error(`Interpolation must be between 0 and 1 but was ${interpolation}`)
    }
    this.sendCommand(`set light ${light.name} interpolation ${interpolation}`)
  }
  
  setPriority(light, priority = 128) {
    if(priority < 0 || speed > 256) {
      throw new Error(`Priority must be between 0 and 256 but was ${priority}`)
    }
    this.sendCommand(`set prioritiy ${priority}`)
  }
  
  sync() {
    this.sendCommand('sync')
  }
  
  ping() {
    this.sendCommand('ping')
  }
}

exports.BoblightClient = BoblightClient
exports.Light = Light
exports.Color = Color
exports.Colors = {...COLORS}
