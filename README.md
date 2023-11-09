# viziot-mqtt-client-nodejs

<img src="/logo.png" alt="drawing" height="200"/>

The node.js MQTT client for VizIoT.com allows you to send data from devices to the VizIoT.com server and get new parameter values to control the device.

Installation
=============

`$ npm install viziot-mqtt-client-nodejs --save`

Example of use
=============

The example connects to the broker and allows you to:
- send once a minute the time, a random number (from 1 to 100), and an indication of the data being sent.
- manage data sending via VizIoT.com website.

To send data to the device, the user must specify in the device settings that the type of parameter "sendTestData" = "On / Off 0-1". After that, the device will have a switch on the website that sends 0 or 1 to the device when switched on or off.

```javascript
'use strict';
//#device key and password
let keyDevice = '________________';
let passDevice = '____________________';

let sendTestData = 1;
let idIntervalSend = 0;
let intervalTime = 60000;

let viziotMQTT = require('viziot-mqtt-client-nodejs');
let viziotMQTTClient = new viziotMQTT(keyDevice, passDevice);

viziotMQTTClient.connect(function (isConnect) {
  if(isConnect){
    clearInterval(idIntervalSend);
    idIntervalSend = setInterval(function () {
      sendDataToServer();
    }, intervalTime);
    viziotMQTTClient.startListenCommands(function (parameter, value) {
      if(parameter == "sendTestData"){
        sendTestData = value;
      }
    });
  }
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendDataToServer() {
  if(sendTestData){
    let packet = {
      'date': parseInt(new Date().getTime()/1000),
      'testData': getRandomInt(1, 100),
      'sendTestData': sendTestData
    };
    viziotMQTTClient.sendDataToVizIoT(packet, function (err) {
      if (err) {
        console.log("Error sendDataToVizIoT", err);
      }
    });
  }
}
```


<a name="api"></a>
## Class Description

  * <a href="#constructor"><code><b>new viziotMQTT()</b></code></a>
  * <a href="#connect"><code>viziotMQTT#<b>connect()</b></code></a>
  * <a href="#sendDataToVizIoT"><code>viziotMQTT#<b>sendDataToVizIoT()</b></code></a>
  * <a href="#startListenCommands"><code>viziotMQTT#<b>startListenCommands()</b></code></a>
  

<a name="constructor"></a>
### Constructor let viziotMQTTClient = new viziotMQTT(keyDevice, passDevice [, mqttHost])
- keyDevice: device key from VizIoT.com
- passDevice: device password from VizIoT.com
- mqttHost: optional parameter. Default is "mqtt://viziot.com:48651"

<a name="connect"></a>
### Connecting to the server viziotMQTTClient.connect([callback])
- callback: optional parameter. If specified, it will be called when the MQTT client connects to the server.

<a name="sendDataToVizIoT"></a>
### Sending data to the server viziotMQTTClient.sendDataToVizIoT(data [, callback])
- data: data to be sent to the server can be a string in JSON format or an object (associative array).
- callback: optional parameter. Accepts two parameters:
  - err: if there is an error, its text description will be specified, otherwise undefined.
  - isSend: on a successful send true on a fasle error.
  
<a name="startListenCommands"></a>
### Handler of received commands viziotMQTTClient.startListenCommands(callback)
- callback: if the device receives a command, the callback function with two parameters is called:
    - parameter - command or parameter key
      - value - value 0 or 1



