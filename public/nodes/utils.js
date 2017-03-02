/**
 * Created by Derwish (derwish.pro@gmail.com) on 01.02.17.
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
    class Utils {
        /***
         * Clone object
         * @param obj
         * @param target
         * @returns {any}
         */
        static cloneObject(obj, target) {
            if (obj == null)
                return null;
            let r = JSON.parse(JSON.stringify(obj));
            if (!target)
                return r;
            for (let i in r)
                target[i] = r[i];
            return target;
        }
        ;
        /**
         * Generate GUID string
         * @returns {string}
         */
        static guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }
        /**
         * Compare objects
         * @param a
         * @param b
         * @returns {boolean}
         */
        static compareObjects(a, b) {
            for (let i in a)
                if (a[i] != b[i])
                    return false;
            return true;
        }
        /**
         * Calculate distance
         * @param a
         * @param b
         * @returns {number}
         */
        static distance(a, b) {
            return Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
        }
        /**
         * Conver color to string
         * @param c
         * @returns {string}
         */
        static colorToString(c) {
            return "rgba(" + Math.round(c[0] * 255).toFixed() + "," + Math.round(c[1] * 255).toFixed() + "," + Math.round(c[2] * 255).toFixed() + "," + (c.length == 4 ? c[3].toFixed(2) : "1.0") + ")";
        }
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
        static isInsideRectangle(x, y, left, top, width, height) {
            if (left < x && (left + width) > x &&
                top < y && (top + height) > y)
                return true;
            return false;
        }
        /**
         * Grow bounding
         * @param bounding [minx,miny,maxx,maxy]
         * @param x
         * @param y
         */
        static growBounding(bounding, x, y) {
            if (x < bounding[0])
                bounding[0] = x;
            else if (x > bounding[2])
                bounding[2] = x;
            if (y < bounding[1])
                bounding[1] = y;
            else if (y > bounding[3])
                bounding[3] = y;
        }
        /**
         * Compute is point inside bounding
         * @param p
         * @param bb
         * @returns {boolean}
         */
        static isInsideBounding(p, bb) {
            if (p[0] < bb[0][0] ||
                p[1] < bb[0][1] ||
                p[0] > bb[1][0] ||
                p[1] > bb[1][1])
                return false;
            return true;
        }
        /**
         * Compute is bounings overlap
         * @param a
         * @param b
         * @returns {boolean}
         */
        static overlapBounding(a, b) {
            if (a[0] > b[2] ||
                a[1] > b[3] ||
                a[2] < b[0] ||
                a[3] < b[1])
                return false;
            return true;
        }
        /**
         * Convert a hex value to its decimal value - the inputted hex must be in the
         * format of a hex triplet - the kind we use for HTML colours. The function
         * will return an array with three values.
         * @param hex
         * @returns {[number,number,number]}
         */
        static hex2num(hex) {
            if (hex.charAt(0) == "#")
                hex = hex.slice(1); //Remove the '#' char - if there is one.
            hex = hex.toUpperCase();
            let hex_alphabets = "0123456789ABCDEF";
            let value;
            let k = 0;
            let int1, int2;
            for (let i = 0; i < 6; i += 2) {
                int1 = hex_alphabets.indexOf(hex.charAt(i));
                int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
                value[k] = (int1 * 16) + int2;
                k++;
            }
            return value;
        }
        /**
         * Give a array with three values as the argument and the function will return
         * the corresponding hex triplet.
         * @param triplet
         * @returns {string}
         */
        static num2hex(triplet) {
            let hex_alphabets = "0123456789ABCDEF";
            let hex = "#";
            let int1, int2;
            for (let i = 0; i < 3; i++) {
                int1 = triplet[i] / 16;
                int2 = triplet[i] % 16;
                hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
            }
            return (hex);
        }
        /**
         * Extend class
         * @param target
         * @param origin
         */
        static extendClass(target, origin) {
            for (let i in origin) {
                if (target.hasOwnProperty(i))
                    continue;
                target[i] = origin[i];
            }
            if (origin.prototype)
                for (let i in origin.prototype) {
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
        }
        static formatValue(val, type) {
            switch (type) {
                case "any" || "" || null:
                    return val;
                case "number":
                    return parseFloat(val) || 0;
                case "string":
                    return "" + val;
                case "boolean":
                    return val == true || val == 1 || val == "true";
            }
        }
        static formatAndTrimValue(val) {
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
                if (val.length > 8)
                    val = val.substr(0, 8) + "...";
                return val;
            }
            val = "" + val;
            if (val.length > 8)
                val = val.substr(0, 8) + "...";
            return val;
        }
        /**
         * Get current time
         * @returns {number}
         */
        static getTime() {
            return (typeof (performance) != "undefined") ? performance.now() : Date.now();
        }
        ;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Utils;
});
//# sourceMappingURL=utils.js.map