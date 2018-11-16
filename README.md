# vizoit-mqtt-client-nodejs

<img src="/logo.png" alt="drawing" height="200"/>

MQTT клиент node.js для сайта VizIoT.com позволяет отправлять данный с устройств на сервер VizIoT.com и получать новые значения параметров для управления устройством.

Установка
=============

`$ npm install vizoit-mqtt-client-nodejs --save`

Пример использования
=============

Пример подключается к брокеру и позволяет:
- отправлять раз в минуту время, случайное число (от 1 до 100), и признак отправки данных.
- управлять отправкой данных через сайт VizIoT.com.

Для отправки данных пользователь должен:
- укажет в настройках устройства что тип параметра "sendTestData" = "Вкл / Выкл 0-1" .
- у устройства появится переключатель, который при включении или выключении отправляет на устройство 0 или 1.

```javascript
'use strict';
//#ключ и пароль устройства
let keyDevice = '________________';
let passDevice = '____________________';

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


Описание класса
=============
