# vizoit-mqtt-client-nodejs

<img src="/logo.png" alt="drawing" height="200"/>

MQTT клиент node.js для сайта VizIoT.com
Позвоялет отправлять данный с устройств на сервер VizIoT.com и получасть новые значения параметров для управления устройством.

Установка
=============

`$ npm install vizoit-mqtt-client-nodejs --save`

Пример использования
=============

```javascript
'use strict';
//#ключ и пароль устройства
let keyDevice = 'JXERBNMAM1ELFQH1';
let passDevice = '4ZJL1XCQJZ0C27R9L8BT';

let sendTestData = 1;
let idIntervalSend = 0;
let intervalTime = 60000;

let viziotMQTT = require('./ViziotMQTT.js');
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


Описание класа
=============
