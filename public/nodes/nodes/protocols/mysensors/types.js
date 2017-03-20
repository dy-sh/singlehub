/**
 * Created by Derwish (derwish.pro@gmail.com) on 14.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    /**
     * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
     * License: http://www.gnu.org/licenses/gpl-3.0.txt
     */
    exports.messageType = {
        C_PRESENTATION: 0,
        C_SET: 1,
        C_REQ: 2,
        C_INTERNAL: 3,
        C_STREAM: 4
    };
    exports.messageTypeKey = [
        "C_PRESENTATION",
        "C_SET",
        "C_REQ",
        "C_INTERNAL",
        "C_STREAM"
    ];
    exports.sensorType = {
        S_DOOR: 0,
        S_MOTION: 1,
        S_SMOKE: 2,
        S_LIGHT: 3,
        S_DIMMER: 4,
        S_COVER: 5,
        S_TEMP: 6,
        S_HUM: 7,
        S_BARO: 8,
        S_WIND: 9,
        S_RAIN: 10,
        S_UV: 11,
        S_WEIGHT: 12,
        S_POWER: 13,
        S_HEATER: 14,
        S_DISTANCE: 15,
        S_LIGHT_LEVEL: 16,
        S_ARDUINO_NODE: 17,
        S_ARDUINO_REPEATER_NODE: 18,
        S_LOCK: 19,
        S_IR: 20,
        S_WATER: 21,
        S_AIR_QUALITY: 22,
        S_CUSTOM: 23,
        S_DUST: 24,
        S_SCENE_CONTROLLER: 25,
        S_RGB_LIGHT: 26,
        S_RGBW_LIGHT: 27,
        S_COLOR_SENSOR: 28,
        S_HVAC: 29,
        S_MULTIMETER: 30,
        S_SPRINKLER: 31,
        S_WATER_LEAK: 32,
        S_SOUND: 33,
        S_VIBRATION: 34,
        S_MOISTUR: 35
    };
    exports.sensorTypeKey = [
        "S_DOOR",
        "S_MOTION",
        "S_SMOKE",
        "S_LIGHT",
        "S_BINARY",
        "S_DIMMER",
        "S_COVER",
        "S_TEMP",
        "S_HUM",
        "S_BARO",
        "S_WIND",
        "S_RAIN",
        "S_UV",
        "S_WEIGHT",
        "S_POWER",
        "S_HEATER",
        "S_DISTANCE",
        "S_LIGHT_LEVEL",
        "S_ARDUINO_NODE",
        "S_ARDUINO_REPEATER_NODE",
        "S_LOCK",
        "S_IR",
        "S_WATER",
        "S_AIR_QUALITY",
        "S_CUSTOM",
        "S_DUST",
        "S_SCENE_CONTROLLER",
        "S_RGB_LIGHT",
        "S_RGBW_LIGHT",
        "S_COLOR_SENSOR",
        "S_HVAC",
        "S_MULTIMETER",
        "S_SPRINKLER",
        "S_WATER_LEAK",
        "S_SOUND",
        "S_VIBRATION",
        "S_MOISTURE"
    ];
    exports.sensorSimpleType = {
        "Door": 0,
        "Motion": 1,
        "Smoke": 2,
        //  S_LIGHT": 3,
        "Binary": 3,
        "Dimmer": 4,
        "Cover": 5,
        "Temperature": 6,
        "Humidity": 7,
        "Baro": 8,
        "Wind": 9,
        "Rain": 10,
        "UV": 11,
        "Weight": 12,
        "Power": 13,
        "Heater": 14,
        "Distance": 15,
        "Light level": 16,
        "Non-repeater node": 17,
        "Repeater node": 18,
        "Lock": 19,
        "IR": 20,
        "Water": 21,
        "Air quality": 22,
        "Custom": 23,
        "Dust": 24,
        "Scene controller": 25,
        "RGB Light": 26,
        "RGBW Light": 27,
        "Color sensor": 28,
        "HVAC": 29,
        "Multimiter": 30,
        "Sprinkler": 31,
        "Water leak": 32,
        "Sound": 33,
        "Vibration": 34,
        "Moisture": 35
    };
    exports.sensorDataType = {
        V_TEMP: 0,
        V_HUM: 1,
        V_LIGHT: 2,
        V_DIMMER: 3,
        V_PRESSURE: 4,
        V_FORECAST: 5,
        V_RAIN: 6,
        V_RAINRATE: 7,
        V_WIND: 8,
        V_GUST: 9,
        V_DIRECTION: 10,
        V_UV: 11,
        V_WEIGHT: 12,
        V_DISTANCE: 13,
        V_IMPEDANCE: 14,
        V_ARMED: 15,
        V_TRIPPED: 16,
        V_WATT: 17,
        V_KWH: 18,
        V_SCENE_ON: 19,
        V_SCENE_OFF: 20,
        V_HEATER: 21,
        V_HEATER_SW: 22,
        V_LIGHT_LEVEL: 23,
        V_VAR1: 24,
        V_VAR2: 25,
        V_VAR3: 26,
        V_VAR4: 27,
        V_VAR5: 28,
        V_UP: 29,
        V_DOWN: 30,
        V_STOP: 31,
        V_IR_SEND: 32,
        V_IR_RECEIVE: 33,
        V_FLOW: 34,
        V_VOLUME: 35,
        V_LOCK_STATUS: 36,
        V_LEVEL: 37,
        V_VOLTAGE: 38,
        V_CURRENT: 39,
        V_RGB: 40,
        V_RGBW: 41,
        V_ID: 42,
        V_UNIT_PREFIX: 43,
        V_HVAC_SETPOINT_COOL: 44,
        V_HVAC_SETPOINT_HEAT: 45,
        V_HVAC_FLOW_MOD: 46
    };
    exports.sensorDataTypeKey = [
        "V_TEMP",
        "V_HUM",
        "V_STATUS",
        "V_PERCENTAGE",
        "V_PRESSURE",
        "V_FORECAST",
        "V_RAIN",
        "V_RAINRATE",
        "V_WIND",
        "V_GUST",
        "V_DIRECTION",
        "V_UV",
        "V_WEIGHT",
        "V_DISTANCE",
        "V_IMPEDANCE",
        "V_ARMED",
        "V_TRIPPED",
        "V_WATT",
        "V_KWH",
        "V_SCENE_ON",
        "V_SCENE_OFF",
        "V_HVAC_FLOW_STATE",
        "V_HVAC_SPEED",
        "V_LIGHT_LEVEL",
        "V_VAR1",
        "V_VAR2",
        "V_VAR3",
        "V_VAR4",
        "V_VAR5",
        "V_UP",
        "V_DOWN",
        "V_STOP",
        "V_IR_SEND",
        "V_IR_RECEIVE",
        "V_FLOW",
        "V_VOLUME",
        "V_LOCK_STATUS",
        "V_LEVEL",
        "V_VOLTAGE",
        "V_CURRENT",
        "V_RGB",
        "V_RGBW",
        "V_ID",
        "V_UNIT_PREFIX",
        "V_HVAC_SETPOINT_COOL",
        "V_HVAC_SETPOINT_HEAT",
        "V_HVAC_FLOW_MODE"
    ];
    exports.internalDataType = {
        I_BATTERY_LEVEL: 0,
        I_TIME: 1,
        I_VERSION: 2,
        I_ID_REQUEST: 3,
        I_ID_RESPONSE: 4,
        I_INCLUSION_MODE: 5,
        I_CONFIG: 6,
        I_PING: 7,
        I_PING_ACK: 8,
        I_LOG_MESSAGE: 9,
        I_CHILDREN: 10,
        I_SKETCH_NAME: 11,
        I_SKETCH_VERSION: 12,
        I_REBOOT: 13,
        I_GATEWAY_READY: 14,
        I_REQUEST_SIGNING: 15,
        I_GET_NONCE: 16,
        I_GET_NONCE_RESPONSE: 17
    };
    exports.internalDataTypeKey = [
        "I_BATTERY_LEVEL",
        "I_TIME",
        "I_VERSION",
        "I_ID_REQUEST",
        "I_ID_RESPONSE",
        "I_INCLUSION_MODE",
        "I_CONFIG",
        "I_FIND_PARENT",
        "I_FIND_PARENT_RESPONSE",
        "I_LOG_MESSAGE",
        "I_CHILDREN",
        "I_SKETCH_NAME",
        "I_SKETCH_VERSION",
        "I_REBOOT",
        "I_GATEWAY_READY",
        "I_REQUEST_SIGNING",
        "I_GET_NONCE",
        "I_GET_NONCE_RESPONSE"
    ];
    exports.stream = {
        ST_FIRMWARE_CONFIG_REQUEST: 0,
        ST_FIRMWARE_CONFIG_RESPONSE: 1,
        ST_FIRMWARE_REQUEST: 2,
        ST_FIRMWARE_RESPONSE: 3,
        ST_SOUND: 4,
        ST_IMAGE: 5
    };
    exports.streamKey = [
        "ST_FIRMWARE_CONFIG_REQUEST",
        "ST_FIRMWARE_CONFIG_RESPONSE",
        "ST_FIRMWARE_REQUEST",
        "ST_FIRMWARE_RESPONSE",
        "ST_SOUND",
        "ST_IMAGE"
    ];
    function getDefaultDataType(sensor_type) {
        switch (sensor_type) {
            case exports.sensorType.S_DOOR:
                return exports.sensorDataType.V_TRIPPED;
            case exports.sensorType.S_MOTION:
                return exports.sensorDataType.V_TRIPPED;
            case exports.sensorType.S_SMOKE:
                return exports.sensorDataType.V_TRIPPED;
            // case sensorType.S_BINARY:
            // 	return sensorDataType.V_STATUS;
            case exports.sensorType.S_DIMMER:
                return exports.sensorDataType.V_DIMMER;
            // case sensorType.S_COVER:
            // 	return sensorDataType.V_PERCENTAGE;
            case exports.sensorType.S_TEMP:
                return exports.sensorDataType.V_TEMP;
            case exports.sensorType.S_HUM:
                return exports.sensorDataType.V_HUM;
            case exports.sensorType.S_BARO:
                return exports.sensorDataType.V_PRESSURE;
            case exports.sensorType.S_WIND:
                return exports.sensorDataType.V_WIND;
            case exports.sensorType.S_RAIN:
                return exports.sensorDataType.V_RAIN;
            case exports.sensorType.S_UV:
                return exports.sensorDataType.V_UV;
            case exports.sensorType.S_WEIGHT:
                return exports.sensorDataType.V_WEIGHT;
            case exports.sensorType.S_POWER:
                return exports.sensorDataType.V_WATT;
            case exports.sensorType.S_HEATER:
                return exports.sensorDataType.V_TEMP;
            case exports.sensorType.S_DISTANCE:
                return exports.sensorDataType.V_DISTANCE;
            case exports.sensorType.S_LIGHT_LEVEL:
                return exports.sensorDataType.V_LIGHT_LEVEL;
            case exports.sensorType.S_ARDUINO_NODE:
                return null;
            case exports.sensorType.S_ARDUINO_REPEATER_NODE:
                return null;
            case exports.sensorType.S_LOCK:
                return exports.sensorDataType.V_LOCK_STATUS;
            case exports.sensorType.S_IR:
                return exports.sensorDataType.V_IR_SEND;
            case exports.sensorType.S_WATER:
                return exports.sensorDataType.V_VOLUME;
            case exports.sensorType.S_AIR_QUALITY:
                return exports.sensorDataType.V_LEVEL;
            case exports.sensorType.S_CUSTOM:
                return null;
            case exports.sensorType.S_DUST:
                return exports.sensorDataType.V_LEVEL;
            case exports.sensorType.S_SCENE_CONTROLLER:
                return exports.sensorDataType.V_SCENE_ON;
            case exports.sensorType.S_RGB_LIGHT:
                return exports.sensorDataType.V_RGB;
            case exports.sensorType.S_RGBW_LIGHT:
                return exports.sensorDataType.V_RGBW;
            case exports.sensorType.S_COLOR_SENSOR:
                return exports.sensorDataType.V_RGB;
            case exports.sensorType.S_HVAC:
                return exports.sensorDataType.V_HVAC_SETPOINT_HEAT;
            case exports.sensorType.S_MULTIMETER:
                return exports.sensorDataType.V_VOLTAGE;
            // case sensorType.S_SPRINKLER:
            // 	return sensorDataType.V_STATUS;
            case exports.sensorType.S_WATER_LEAK:
                return exports.sensorDataType.V_TRIPPED;
            case exports.sensorType.S_SOUND:
                return exports.sensorDataType.V_LEVEL;
            case exports.sensorType.S_VIBRATION:
                return exports.sensorDataType.V_LEVEL;
        }
    }
    exports.getDefaultDataType = getDefaultDataType;
});
//# sourceMappingURL=types.js.map