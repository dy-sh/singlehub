/**
 * Created by Derwish (derwish.pro@gmail.com) on 01.02.17.
 */
"use strict";
var Utils = (function () {
    function Utils() {
    }
    /***
     * Clone object
     * @param obj
     * @param target
     * @returns {any}
     */
    Utils.cloneObject = function (obj, target) {
        if (obj == null)
            return null;
        var r = JSON.parse(JSON.stringify(obj));
        if (!target)
            return r;
        for (var i in r)
            target[i] = r[i];
        return target;
    };
    ;
    /**
     * Generate GUID string
     * @returns {string}
     */
    Utils.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    /**
     * Compare objects
     * @param a
     * @param b
     * @returns {boolean}
     */
    Utils.compareObjects = function (a, b) {
        for (var i in a)
            if (a[i] != b[i])
                return false;
        return true;
    };
    /**
     * Calculate distance
     * @param a
     * @param b
     * @returns {number}
     */
    Utils.distance = function (a, b) {
        return Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
    };
    /**
     * Conver color to string
     * @param c
     * @returns {string}
     */
    Utils.colorToString = function (c) {
        return "rgba(" + Math.round(c[0] * 255).toFixed() + "," + Math.round(c[1] * 255).toFixed() + "," + Math.round(c[2] * 255).toFixed() + "," + (c.length == 4 ? c[3].toFixed(2) : "1.0") + ")";
    };
    /**
     * Compute is shape inside a rectangle
     * @param x
     * @param y
     * @param left
     * @param top
     * @param width
     * @param height
     * @returns {boolean}
     */
    Utils.isInsideRectangle = function (x, y, left, top, width, height) {
        if (left < x && (left + width) > x &&
            top < y && (top + height) > y)
            return true;
        return false;
    };
    /**
     * Grow bounding
     * @param bounding [minx,miny,maxx,maxy]
     * @param x
     * @param y
     */
    Utils.growBounding = function (bounding, x, y) {
        if (x < bounding[0])
            bounding[0] = x;
        else if (x > bounding[2])
            bounding[2] = x;
        if (y < bounding[1])
            bounding[1] = y;
        else if (y > bounding[3])
            bounding[3] = y;
    };
    /**
     * Compute is point inside bounding
     * @param p
     * @param bb
     * @returns {boolean}
     */
    Utils.isInsideBounding = function (p, bb) {
        if (p[0] < bb[0][0] ||
            p[1] < bb[0][1] ||
            p[0] > bb[1][0] ||
            p[1] > bb[1][1])
            return false;
        return true;
    };
    /**
     * Compute is bounings overlap
     * @param a
     * @param b
     * @returns {boolean}
     */
    Utils.overlapBounding = function (a, b) {
        if (a[0] > b[2] ||
            a[1] > b[3] ||
            a[2] < b[0] ||
            a[3] < b[1])
            return false;
        return true;
    };
    /**
     * Convert a hex value to its decimal value - the inputted hex must be in the
     * format of a hex triplet - the kind we use for HTML colours. The function
     * will return an array with three values.
     * @param hex
     * @returns {[number,number,number]}
     */
    Utils.hex2num = function (hex) {
        if (hex.charAt(0) == "#")
            hex = hex.slice(1); //Remove the '#' char - if there is one.
        hex = hex.toUpperCase();
        var hex_alphabets = "0123456789ABCDEF";
        var value;
        var k = 0;
        var int1, int2;
        for (var i = 0; i < 6; i += 2) {
            int1 = hex_alphabets.indexOf(hex.charAt(i));
            int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
            value[k] = (int1 * 16) + int2;
            k++;
        }
        return value;
    };
    /**
     * Give a array with three values as the argument and the function will return
     * the corresponding hex triplet.
     * @param triplet
     * @returns {string}
     */
    Utils.numsToRgbHex = function (triplet) {
        var hex_alphabets = "0123456789ABCDEF";
        var hex = "#";
        var int1, int2;
        for (var i = 0; i < 3; i++) {
            int1 = triplet[i] / 16;
            int2 = triplet[i] % 16;
            hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
        }
        return (hex);
    };
    Utils.numsToRgbwHex = function (triplet) {
        var hex_alphabets = "0123456789ABCDEF";
        var hex = "#";
        var int1, int2;
        for (var i = 0; i < 4; i++) {
            int1 = triplet[i] / 16;
            int2 = triplet[i] % 16;
            hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
        }
        return (hex);
    };
    /**
     * Extend class
     * @param target
     * @param origin
     */
    Utils.extendClass = function (target, origin) {
        for (var i in origin) {
            if (target.hasOwnProperty(i))
                continue;
            target[i] = origin[i];
        }
        if (origin.prototype)
            for (var i in origin.prototype) {
                if (!origin.prototype.hasOwnProperty(i))
                    continue;
                if (target.prototype.hasOwnProperty(i))
                    continue;
                //copy getters
                if (origin.prototype.__lookupGetter__(i))
                    target.prototype.__defineGetter__(i, origin.prototype.__lookupGetter__(i));
                else
                    target.prototype[i] = origin.prototype[i];
                //and setters
                if (origin.prototype.__lookupSetter__(i))
                    target.prototype.__defineSetter__(i, origin.prototype.__lookupSetter__(i));
            }
    };
    Utils.formatValue = function (val, type) {
        if (val == null)
            return null;
        if (type == "number" && typeof val != "number") {
            if (typeof val == "boolean")
                return val ? 1 : 0;
            else
                return parseFloat(val) || 0;
        }
        else if (type == "string" && typeof val != "string")
            return "" + val;
        else if (type == "boolean" && typeof val != "boolean")
            return val == true || val == 1 || val == "true";
        return val;
    };
    Utils.formatAndTrimValue = function (val) {
        if (val == null)
            return "";
        if (typeof (val) == "boolean") {
            return val ? "true" : "false";
        }
        if (typeof (val) == "number") {
            val = parseFloat(val.toFixed(3));
            return "" + val;
        }
        if (typeof (val) == "object") {
            return "[object]";
        }
        if (typeof (val) == "string") {
            if (val.length > 9)
                val = val.substr(0, 9) + "...";
            return val;
        }
        val = "" + val;
        if (val.length > 9)
            val = val.substr(0, 9) + "...";
        return val;
    };
    /**
     * Get current time
     * @returns {number}
     */
    Utils.getTime = function () {
        return (typeof (performance) != "undefined") ? performance.now() : Date.now();
    };
    ;
    Utils.toFixedNumber = function (value, digits) {
        var pow = Math.pow(10, digits);
        return +(Math.round(value * pow) / pow);
    };
    Utils.clamp = function (value, min, max) {
        return Math.min(Math.max(value, min), max);
    };
    Utils.remap = function (value, inMin, inMax, outMin, outMax) {
        return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
    };
    return Utils;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Utils;
