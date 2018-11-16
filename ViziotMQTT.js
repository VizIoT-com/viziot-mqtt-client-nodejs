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
const urlMQTTServer = 'mqtt://viziot.com:48651';
let mqtt = require('mqtt');
module.exports = class VizIoTMQTT {

	constructor(deviceKey, devicePass) {
		this.keyAndPassIsOk = false;
		deviceKey = deviceKey.replace(/[^A-Za-z0-9]/g, "");
		devicePass = devicePass.replace(/[^A-Za-z0-9]/g, "");
		if(deviceKey.length == 16 && devicePass.length == 20){
			this.key = deviceKey;
			this.pass = devicePass;
			this.topicForPublish = '/devices/' + deviceKey + '/packet';
			this.topicForSubscribe = '/devices/' + deviceKey + '/param/+';
			this.keyAndPassIsOk = true;
		}
	}

	connect(callback) {
		if(this.keyAndPassIsOk){
			this.mqttClient = mqtt.connect(urlMQTTServer, {'username': this.key, 'password': this.pass});
			this.mqttClient.on('connect', function (connect) {
				console.log("MQTT Event 'connect'", connect);
				callback(true);
			});
			this.mqttClient.on('reconnect', function () {
				console.log("MQTT Event 'reconnect'");
			});
			this.mqttClient.on('close', function () {
				console.log("MQTT Event 'close'");
			});
			this.mqttClient.on('offline', function () {
				console.log("MQTT Event 'offline'");
			});
			this.mqttClient.on('error', function (error) {
				if (error) {
					console.log("MQTT Event 'error'", error);
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
	 * 		parameter - ключ параметра
	 * 		value - значение параметра
	 * @param callback
	 */
	startListenCommands(callback) {
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
	 * в функцию передается массив или объект ждя отправки его на Сервер VizIoT
	 * @param data
	 * @param callback
	 */
	sendDataToVizIoT(data, callback){
		if(typeof callback != "function"){
			callback = function (err) {
				if(err){
					console.log("Error in sendDataToVizIoT!", err);
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
					callback("Ошибка! Параметр не является массивом или объектом");
					return false;
				}
				break;
			case "object":
				if(data != null){
					packet = JSON.stringify(data);
				}else{
					callback("Ошибка! Данные для отправки не могут == null");
					return false;
				}
				break;
			default:
				callback("Ошибка! Параметр не является массивом или объектом");
				return false;
				break;
		}
		if(packet.length <= 2){
			callback("Ошибка! Попытка отправить пустые данные");
			return false;
		}
		this.mqttClient.publish(this.topicForPublish, packet, function (err) {
			if (err) {
				callback(err);
			}else{
				callback();
			}
		});
	}

};
