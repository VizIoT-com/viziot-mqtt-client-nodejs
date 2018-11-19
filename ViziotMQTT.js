'use strict';
// ==================================================================================
// VizIoTMQTT.js
// ----------------------------------------------------------------------------------
// Description:   MQTT client node.js for web site VizIoT.com
// Copyright:     (c) 2017 - 2018
// Author:        VizIoT.com
// ----------------------------------------------------------------------------------
// Contributors:  Trunov Alexandr
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

const defaultHost = 'mqtt://viziot.com:48651';
let mqtt = require('mqtt');
var errorsVizIoT = {
	0: '',
	1: 'Ключ или пароль устройства записаны в неправильном формате',
	2: "Ошибка! Параметр не является массивом или объектом",
	3: "Ошибка! Данные для отправки не могут == null",
	4: "Ошибка! Параметр не является массивом или объектом",
	5: "Ошибка! Попытка отправить пустые данные",
	6: "Ошибка! Не указан callback"

};
var errorsMQTT = {
	0: '',
	1: 'Unacceptable protocol version',
	2: 'Identifier rejected',
	3: 'Server unavailable',
	4: 'Bad username or password',
	5: 'Ошибка авторизации. Проверьте ключ и пароль устройства.',
	16: 'No matching subscribers',
	17: 'No subscription existed',
	128: 'Unspecified error',
	129: 'Malformed Packet',
	130: 'Protocol Error',
	131: 'Implementation specific error',
	132: 'Unsupported Protocol Version',
	133: 'Client Identifier not valid',
	134: 'Bad User Name or Password',
	135: 'Not authorized',
	136: 'Server unavailable',
	137: 'Server busy',
	138: 'Banned',
	139: 'Server shutting down',
	140: 'Bad authentication method',
	141: 'Keep Alive timeout',
	142: 'Session taken over',
	143: 'Topic Filter invalid',
	144: 'Topic Name invalid',
	145: 'Packet identifier in use',
	146: 'Packet Identifier not found',
	147: 'Receive Maximum exceeded',
	148: 'Topic Alias invalid',
	149: 'Packet too large',
	150: 'Message rate too high',
	151: 'Quota exceeded',
	152: 'Administrative action',
	153: 'Payload format invalid',
	154: 'Retain not supported',
	155: 'QoS not supported',
	156: 'Use another server',
	157: 'Server moved',
	158: 'Shared Subscriptions not supported',
	159: 'Connection rate exceeded',
	160: 'Maximum connect time',
	161: 'Subscription Identifiers not supported',
	162: 'Wildcard Subscriptions not supported'
};
module.exports = class VizIoTMQTT {

	/**
	 * Инициализация Объекта VizIoTMQTT
	 * @param deviceKey - ключ устройства с сайта VizIoT.com
	 * @param devicePass - пароль устройства с сайта VizIoT.com
	 * @param mqttHost - можно не указывать. По умолчанию "mqtt://viziot.com:48651"
	 */
	constructor(deviceKey, devicePass, mqttHost) {
		if(mqttHost == undefined){
			this.hostBroker = defaultHost;
		}else{
			this.hostBroker = mqttHost;
		}
		this.keyAndPassIsOk = false;
		deviceKey = deviceKey.replace(/[^A-Za-z0-9]/g, "");
		devicePass = devicePass.replace(/[^A-Za-z0-9]/g, "");
		if(deviceKey.length == 16 && devicePass.length == 20){
			this.key = deviceKey;
			this.pass = devicePass;
			this.topicForPublish = '/devices/' + deviceKey + '/packet';
			this.topicForSubscribe = '/devices/' + deviceKey + '/param/+';
			this.keyAndPassIsOk = true;
		}else{
			console.log(errorsVizIoT[1]);
		}
	}

	connect(callback) {
		if(typeof callback != "function"){
			// console.log(new Error(errorsVizIoT[6]));
			callback = function () {

			};
		}
		if(this.keyAndPassIsOk){
			let dataForConnectToBroker = {
				'username': this.key,
				'password': this.pass,
				'reconnectPeriod': 5000
			};

			this.mqttClient = mqtt.connect(this.hostBroker, dataForConnectToBroker);
			this.mqttClient.on('connect', function (connect) {
				console.log("Соединение с MQTT брокером VizIoT.com установлено.");
				callback();
			});
			this.mqttClient.on('reconnect', function () {
				console.log("Пере подключение к MQTT брокеру VizIoT.com.");
			});
			this.mqttClient.on('close', function () {
				console.log("Подключение к MQTT брокеру VizIoT.com закрыто.");
			});
			this.mqttClient.on('offline', function () {
				// console.log("MQTT 'offline'");
			});
			this.mqttClient.on('error', function (error) {
				if (error) {
					console.log(errorsMQTT[error.code]);
				}
			});
		}
	}

	/**
	 * Например
	 * VizIoTClient.startListenMessages(function (topic, message) {
	 * 		.....
	 * })
	 * callback Параметры
	 * 		parameter - ключ команды или параметра
	 * 		value - значение параметра
	 * @param callback
	 */
	startListenCommands(callback) {
		if(typeof callback != "function"){
			console.log(new Error(errorsVizIoT[6]));
			return false;
		}
		let strLengthForDelitfromTopic = this.topicForSubscribe.length;
		this.mqttClient.on('message', function (topic, message, packet) {
			let parameter = topic.substring(strLengthForDelitfromTopic-1);
			let value = message.toString();
			callback(parameter, value);
		});
		this.mqttClient.subscribe(this.topicForSubscribe,  function (err, granted){
			if(err) console.log("subscribe", err, granted);
		});
	}

	/**
	 * в функцию передается массив или объект для отправки на Сервер VizIoT
	 * @param data
	 * @param callback
	 */
	sendDataToVizIoT(data, callback){
		if(typeof callback != "function"){
			callback = function (err) {
				if(err){
					console.log("Ошибка в sendDataToVizIoT!", err);
				}
			}
		}
		let packet = "";
		switch (typeof data){
			case "string":
				try {
					packet = JSON.parse(data);
					packet = JSON.stringify(packet);
				} catch (err) {
					callback(errorsVizIoT[2], false);
					return false;
				}
				break;
			case "object":
				if(data != null){
					packet = JSON.stringify(data);
				}else{
					callback(errorsVizIoT[3], false);
					return false;
				}
				break;
			default:
				callback(errorsVizIoT[4], false);
				return false;
				break;
		}
		if(packet.length <= 2){
			callback(errorsVizIoT[5], false);
			return false;
		}
		this.mqttClient.publish(this.topicForPublish, packet, function (err) {
			if (err) {
				callback(err, false);
			}else{
				callback(undefined, true);
			}
		});
	}

};
