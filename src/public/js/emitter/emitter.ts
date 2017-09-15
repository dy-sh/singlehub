/**
 * Created by Derwish (derwish.pro@gmail.com) on 26.02.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


export class Emitter {

    _events: { [key: string]: Array<any> };

    constructor() {
    }

    // /**
    //  * mixin will delegate all MicroEvent.js function in the destination object
    //  * require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
    //  *
    //  * @param {Object} destObject the object which will support MicroEvent
    //  */
    // static mixin = function(destObject){
    //     let props = ['on', 'once', 'off', 'emit']
    //     for(let i = 0; i < props.length; i ++){
    //         if( typeof destObject === 'function' ){
    //             destObject.prototype[props[i]]	= Emitter.prototype[props[i]];
    //         }else{
    //             destObject[props[i]] = Emitter.prototype[props[i]];
    //         }
    //     }
    //     return destObject;
    // }

    static mixin(obj) {
        for (var key in Emitter.prototype) {
            obj[key] = Emitter.prototype[key];
        }
        return obj;
    }

    /**
     * Add an event listener.
     *
     * @expose
     * @param  {string} event
     * @param  {function(...)} fn
     */
    on = function (event: string, fn: Function) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push({ fn: fn, once: false });
        return this;
    }

    /**
     * Add an event listener that will get executed at most once, even
     * if the event is emitted multiple times.
     *
     * @expose
     * @param  {string} event
     * @param  {function(...)} fn
     */
    once(event: string, fn: Function) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push({ fn: fn, once: true });
        return this;
    }

    /**
     * Remove an event listener.
     *
     * @expose
     * @param  {string} event
     * @param  {function(...)} fn
     */
    off(event: string, fn: Function) {
        let self = this;
        self._events = self._events || {};
        if (event in self._events === false) return;
        self._events[event].map(function (obj, i) {
            if (obj.fn === fn) {
                self._events[event].splice(i, 1)
            }
        });
        return this;
    }

    /**
     * Trigger an event. Execute all listening functions.
     *
     * @expose
     * @type {function(string, ...[*])}
     */
    emit(event: string, ...args: Array<any>) {
        this._events = this._events || {};
        if (event in this._events === false) return;

        for (let i = 0, len = this._events[event].length; i < len; i++) {
            let obj = this._events[event][i];
            obj.fn.apply(this, args);
            if (obj.once) {
                this.off(event, obj.fn)
            }
        }
    }


}

