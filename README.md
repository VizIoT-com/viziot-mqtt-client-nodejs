# viziot-mqtt-client-nodejs

<img src="/logo.png" alt="drawing" height="200"/>

MQTT клиент node.js для сайта VizIoT.com позволяет отправлять данный с устройств на сервер VizIoT.com и получать новые значения параметров для управления устройством.

Установка
=============

`$ npm install viziot-mqtt-client-nodejs --save`

Пример использования
=============

Пример подключается к брокеру и позволяет:
- отправлять раз в минуту время, случайное число (от 1 до 100), и признак отправки данных.
- управлять отправкой данных через сайт VizIoT.com.

Для отправки данных на устройство пользователь должен укажет в настройках устройства что тип параметра "sendTestData" = "Вкл / Выкл 0-1". После этого на сайте у устройства появится переключатель, который при включении или выключении отправляет на устройство 0 или 1.

```javascript
'use strict';
//#ключ и пароль устройства
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
## Описание класса

  * <a href="#constructor"><code><b>new viziotMQTT()</b></code></a>
  * <a href="#connect"><code>viziotMQTT#<b>connect()</b></code></a>
  * <a href="#sendDataToVizIoT"><code>viziotMQTT#<b>sendDataToVizIoT()</b></code></a>
  * <a href="#startListenCommands"><code>viziotMQTT#<b>startListenCommands()</b></code></a>
  

<a name="constructor"></a>
### Конструктор let viziotMQTTClient = new viziotMQTT(keyDevice, passDevice [, mqttHost])
- keyDevice: ключ устройства с сайта VizIoT.com
- passDevice: пароль устройства с сайта VizIoT.com
- mqttHost: не обязательный параметр. По умолчанию "mqtt://viziot.com:48651"

<a name="connect"></a>
### Подключение к серверу viziotMQTTClient.connect([callback])
- callback: не обязательный параметр. Если указать, то будет вызван, когда MQTT клиент подключится к серверу.

<a name="sendDataToVizIoT"></a>
### Отправка данных на сервер viziotMQTTClient.sendDataToVizIoT(data [, callback])
- data: данные для отправки на сервер можно передавать строку в формате JSON или объект (ассоциативный массив).
- callback: не обязательный параметр. Принимает два параметра:
  - err: если есть ошибка, то будет указано ее текстовое описание, в противном случае undefined.
  - isSend: при удачной отправки true при ошибке fasle.
  
<a name="startListenCommands"></a>
### Обработчик получаемых команд viziotMQTTClient.startListenCommands(callback)
- callback: если на устройство поступила команда, то вызывается функция callback с двумя параметрами:
    - parameter - ключ команды или параметра
    - value - значение 0 или 1



