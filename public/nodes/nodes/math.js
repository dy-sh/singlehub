/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "../node", "../container"], factory);
    }
})(function (require, exports) {
    "use strict";
    const node_1 = require("../node");
    const container_1 = require("../container");
    //Math Plus
    class MathPlusNode extends node_1.Node {
        constructor() {
            super();
            this.title = "Plus";
            this.descriprion = "Math plus operation";
            this.addInput("A", "number");
            this.addInput("B", "number");
            this.addOutput("A+B", "number");
        }
        onInputUpdated() {
            let a = this.getInputData(0);
            let b = this.getInputData(1);
            let result = a + b;
            this.setOutputData(0, result);
        }
    }
    container_1.Container.registerNodeType("math/plus", MathPlusNode);
});
//
// //Converter
// 	class Converter {
//         constructor() {
//             this.addInput("in", "*");
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null)
//                 return;
//
//             if (this.outputs)
//                 for (let i = 0; i < this.outputs.length; i++) {
//                     let output = this.outputs[i];
//                     if (!output.links || !output.links.length)
//                         continue;
//
//                     let result = null;
//                     switch (output.name) {
//                         case "number":
//                             result = v.length ? v[0] : parseFloat(v);
//                             break;
//                         case "vec2":
//                         case "vec3":
//                         case "vec4":
//                             let result = null;
//                             let count = 1;
//                             switch (output.name) {
//                                 case "vec2":
//                                     count = 2;
//                                     break;
//                                 case "vec3":
//                                     count = 3;
//                                     break;
//                                 case "vec4":
//                                     count = 4;
//                                     break;
//                             }
//
//                             let result = new Float32Array(count);
//                             if (v.length) {
//                                 for (let j = 0; j < v.length && j < result.length; j++)
//                                     result[j] = v[j];
//                             }
//                             else
//                                 result[0] = parseFloat(v);
//                             break;
//                     }
//                     this.setOutputData(i, result);
//                 }
//         }
//
//         onGetOutputs() {
//             return [["number", "number"], ["vec2", "vec2"], ["vec3", "vec3"], ["vec4", "vec4"]];
//         }
//     }
//
// 	Converter.title = "Converter";
// 	Converter.desc = "type A to type B";
//
//     nodes.registerNodeType("math/converter", Converter);
//
//
// //Bypass
// 	class Bypass {
//         constructor() {
//             this.addInput("in");
//             this.addOutput("out");
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             this.setOutputData(0, v);
//         }
//     }
//
// 	Bypass.title = "Bypass";
// 	Bypass.desc = "removes the type";
//
//     nodes.registerNodeType("math/bypass", Bypass);
//
//
// 	class MathRange {
//         constructor() {
//             this.addInput("in", "number", {locked: true});
//             this.addOutput("out", "number", {locked: true});
//             this.properties = {"in": 0, in_min: 0, in_max: 1, out_min: 0, out_max: 1};
//         }
//
//         onExecute() {
//             if (this.inputs)
//                 for (let i = 0; i < this.inputs.length; i++) {
//                     let input = this.inputs[i];
//                     let v = this.getInputData(i);
//                     if (v === undefined)
//                         continue;
//                     this.properties[input.name] = v;
//                 }
//
//             let v = this.properties["in"];
//             if (v === undefined || v === null || v.constructor !== Number)
//                 v = 0;
//
//             let in_min = this.properties.in_min;
//             let in_max = this.properties.in_max;
//             let out_min = this.properties.out_min;
//             let out_max = this.properties.out_max;
//
//             this._last_v = ((v - in_min) / (in_max - in_min)) * (out_max - out_min) + out_min;
//             this.setOutputData(0, this._last_v);
//         }
//
//         onDrawBackground(ctx) {
//             //show the current value
//             if (this._last_v)
//                 this.outputs[0].label = this._last_v.toFixed(3);
//             else
//                 this.outputs[0].label = "?";
//         }
//
//         onGetInputs() {
//             return [["in_min", "number"], ["in_max", "number"], ["out_min", "number"], ["out_max", "number"]];
//         }
//     }
//
// 	MathRange.title = "Range";
// 	MathRange.desc = "Convert a number from one range to another";
//
//     nodes.registerNodeType("math/range", MathRange);
//
//
// 	class MathRand {
//         constructor() {
//             this.addOutput("value", "number");
//             this.properties = {min: 0, max: 1};
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             if (this.inputs)
//                 for (let i = 0; i < this.inputs.length; i++) {
//                     let input = this.inputs[i];
//                     let v = this.getInputData(i);
//                     if (v === undefined)
//                         continue;
//                     this.properties[input.name] = v;
//                 }
//
//             let min = this.properties.min;
//             let max = this.properties.max;
//             this._last_v = Math.random() * (max - min) + min;
//             this.setOutputData(0, this._last_v);
//         }
//
//         onDrawBackground(ctx) {
//             //show the current value
//             if (this._last_v)
//                 this.outputs[0].label = this._last_v.toFixed(3);
//             else
//                 this.outputs[0].label = "?";
//         }
//
//         onGetInputs() {
//             return [["min", "number"], ["max", "number"]];
//         }
//     }
//
// 	MathRand.title = "Rand";
// 	MathRand.desc = "Random number";
//
//     nodes.registerNodeType("math/rand", MathRand);
//
// //Math clamp
// 	class MathClamp {
//         constructor() {
//             this.addInput("in", "number");
//             this.addOutput("out", "number");
//             this.size = [60, 20];
//             this.properties = {min: 0, max: 1};
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//             v = Math.max(this.properties.min, v);
//             v = Math.min(this.properties.max, v);
//             this.setOutputData(0, v);
//         }
//
//         getCode(lang) {
//             let code = "";
//             if (this.isInputConnected(0))
//                 code += "clamp({{0}}," + this.properties.min + "," + this.properties.max + ")";
//             return code;
//         }
//     }
//
// 	MathClamp.title = "Clamp";
// 	MathClamp.desc = "Clamp number between min and max";
// 	MathClamp.filter = "shader";
//
//     nodes.registerNodeType("math/clamp", MathClamp);
//
//
// //Math ABS
// 	class MathAbs {
//         constructor() {
//             this.addInput("in", "number");
//             this.addOutput("out", "number");
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//             this.setOutputData(0, Math.abs(v));
//         }
//     }
//
// 	MathAbs.title = "Abs";
// 	MathAbs.desc = "Absolute";
//
//     nodes.registerNodeType("math/abs", MathAbs);
//
//
// //Math Floor
// 	class MathFloor {
//         constructor() {
//             this.addInput("in", "number");
//             this.addOutput("out", "number");
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//             this.setOutputData(0, Math.floor(v));
//         }
//     }
//
// 	MathFloor.title = "Floor";
// 	MathFloor.desc = "Floor number to remove fractional part";
//
//     nodes.registerNodeType("math/floor", MathFloor);
//
//
// //Math frac
// 	class MathFrac {
//         constructor() {
//             this.addInput("in", "number");
//             this.addOutput("out", "number");
//             this.size = [60, 20];
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null)
//                 return;
//             this.setOutputData(0, v % 1);
//         }
//     }
//
// 	MathFrac.title = "Frac";
// 	MathFrac.desc = "Returns fractional part";
//
//     nodes.registerNodeType("math/frac", MathFrac);
//
//
// //Math Floor
// 	class MathSmoothStep {
//         constructor() {
//             this.addInput("in", "number");
//             this.addOutput("out", "number");
//             this.size = [60, 20];
//             this.properties = {A: 0, B: 1};
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v === undefined)
//                 return;
//
//             let edge0 = this.properties.A;
//             let edge1 = this.properties.B;
//
//             // Scale, bias and saturate x to 0..1 range
//             v = Math.clamp((v - edge0) / (edge1 - edge0), 0.0, 1.0);
//             // Evaluate polynomial
//             v = v * v * (3 - 2 * v);
//
//             this.setOutputData(0, v);
//         }
//     }
//
// 	MathSmoothStep.title = "Smoothstep";
// 	MathSmoothStep.desc = "Smoothstep";
//
//     nodes.registerNodeType("math/smoothstep", MathSmoothStep);
//
// //Math scale
// 	class MathScale {
//         constructor() {
//             this.addInput("in", "number", {label: ""});
//             this.addOutput("out", "number", {label: ""});
//             this.size = [60, 20];
//             this.properties = {"factor": 1};
//         }
//
//         onExecute() {
//             let value = this.getInputData(0);
//             if (value != null)
//                 this.setOutputData(0, value * this.properties.factor);
//         }
//     }
//
// 	MathScale.title = "Scale";
// 	MathScale.desc = "v * factor";
//
//     nodes.registerNodeType("math/scale", MathScale);
//
//
//
// //Math compare
// 	class MathCompare {
//         constructor() {
//             this.addInput("A", "number");
//             this.addInput("B", "number");
//             this.addOutput("A==B", "boolean");
//             this.addOutput("A!=B", "boolean");
//             this.properties = {A: 0, B: 0};
//         }
//
//         onExecute() {
//             let A = this.getInputData(0);
//             let B = this.getInputData(1);
//             if (A !== undefined)
//                 this.properties["A"] = A;
//             else
//                 A = this.properties["A"];
//
//             if (B !== undefined)
//                 this.properties["B"] = B;
//             else
//                 B = this.properties["B"];
//
//             for (let i = 0, l = this.outputs.length; i < l; ++i) {
//                 let output = this.outputs[i];
//                 if (!output.links || !output.links.length)
//                     continue;
//                 switch (output.name) {
//                     case "A==B":
//                         value = A == B;
//                         break;
//                     case "A!=B":
//                         value = A != B;
//                         break;
//                     case "A>B":
//                         value = A > B;
//                         break;
//                     case "A<B":
//                         value = A < B;
//                         break;
//                     case "A<=B":
//                         value = A <= B;
//                         break;
//                     case "A>=B":
//                         value = A >= B;
//                         break;
//                 }
//                 this.setOutputData(i, value);
//             }
//         }
//
//         onGetOutputs() {
//             return [["A==B", "boolean"], ["A!=B", "boolean"], ["A>B", "boolean"], ["A<B", "boolean"], ["A>=B", "boolean"], ["A<=B", "boolean"]];
//         }
//     }
//
// 	MathCompare.title = "Compare";
// 	MathCompare.desc = "compares between two values";
//
//     nodes.registerNodeType("math/compare", MathCompare);
//
// 	class MathCondition {
//         constructor() {
//             this.addInput("A", "number");
//             this.addInput("B", "number");
//             this.addOutput("out", "boolean");
//             this.properties = {A: 0, B: 1, OP: ">"};
//             this.size = [60, 40];
//         }
//
//         onExecute() {
//             let A = this.getInputData(0);
//             if (A === undefined)
//                 A = this.properties.A;
//             else
//                 this.properties.A = A;
//
//             let B = this.getInputData(1);
//             if (B === undefined)
//                 B = this.properties.B;
//             else
//                 this.properties.B = B;
//
//             let result = true;
//             switch (this.properties.OP) {
//                 case ">":
//                     result = A > B;
//                     break;
//                 case "<":
//                     result = A < B;
//                     break;
//                 case "==":
//                     result = A == B;
//                     break;
//                 case "!=":
//                     result = A != B;
//                     break;
//                 case "<=":
//                     result = A <= B;
//                     break;
//                 case ">=":
//                     result = A >= B;
//                     break;
//             }
//
//             this.setOutputData(0, result);
//         }
//     }
//
// 	MathCondition["@OP"] = {type: "enum", title: "operation", values: [">", "<", "==", "!=", "<=", ">="]};
//
// 	MathCondition.title = "Condition";
// 	MathCondition.desc = "evaluates condition between A and B";
//
//     nodes.registerNodeType("math/condition", MathCondition);
//
//
// 	class MathAccumulate {
//         constructor() {
//             this.addInput("inc", "number");
//             this.addOutput("total", "number");
//             this.properties = {increment: 0, value: 0};
//         }
//
//         onExecute() {
//             let inc = this.getInputData(0);
//             if (inc !== null)
//                 this.properties.value += inc;
//             else
//                 this.properties.value += this.properties.increment;
//             this.setOutputData(0, this.properties.value);
//         }
//     }
//
// 	MathAccumulate.title = "Accumulate";
// 	MathAccumulate.desc = "Increments a value every time";
//
//     nodes.registerNodeType("math/accumulate", MathAccumulate);
//
// //Math Trigonometry
// 	class MathTrigonometry {
//         constructor() {
//             this.addInput("v", "number");
//             this.addOutput("sin", "number");
//             this.properties = {amplitude: 1.0, offset: 0};
//             this.bgImageUrl = "nodes/imgs/icon-sin.png";
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             let amplitude = this.properties["amplitude"];
//             let slot = this.findInputSlot("amplitude");
//             if (slot != -1)
//                 amplitude = this.getInputData(slot);
//             let offset = this.properties["offset"];
//             slot = this.findInputSlot("offset");
//             if (slot != -1)
//                 offset = this.getInputData(slot);
//
//             for (let i = 0, l = this.outputs.length; i < l; ++i) {
//                 let output = this.outputs[i];
//                 switch (output.name) {
//                     case "sin":
//                         value = Math.sin(v);
//                         break;
//                     case "cos":
//                         value = Math.cos(v);
//                         break;
//                     case "tan":
//                         value = Math.tan(v);
//                         break;
//                     case "asin":
//                         value = Math.asin(v);
//                         break;
//                     case "acos":
//                         value = Math.acos(v);
//                         break;
//                     case "atan":
//                         value = Math.atan(v);
//                         break;
//                 }
//                 this.setOutputData(i, amplitude * value + offset);
//             }
//         }
//
//         onGetInputs() {
//             return [["v", "number"], ["amplitude", "number"], ["offset", "number"]];
//         }
//
//         onGetOutputs() {
//             return [["sin", "number"], ["cos", "number"], ["tan", "number"], ["asin", "number"], ["acos", "number"], ["atan", "number"]];
//         }
//     }
//
// 	MathTrigonometry.title = "Trigonometry";
// 	MathTrigonometry.desc = "Sin Cos Tan";
// 	MathTrigonometry.filter = "shader";
//
//
//     nodes.registerNodeType("math/trigonometry", MathTrigonometry);
//
//
// //math library for safe math operations without eval
// 	if (global.math) {
// 		class MathFormula {
//             constructor() {
//                 this.addInputs("x", "number");
//                 this.addInputs("y", "number");
//                 this.addOutputs("", "number");
//                 this.properties = {x: 1.0, y: 1.0, formula: "x+y"};
//             }
//
//             onExecute() {
//                 let x = this.getInputData(0);
//                 let y = this.getInputData(1);
//                 if (x != null)
//                     this.properties["x"] = x;
//                 else
//                     x = this.properties["x"];
//
//                 if (y != null)
//                     this.properties["y"] = y;
//                 else
//                     y = this.properties["y"];
//
//                 let f = this.properties["formula"];
//                 let value = math.eval(f, {x: x, y: y, T: this.container.globaltime});
//                 this.setOutputData(0, value);
//             }
//
//             onDrawBackground() {
//                 let f = this.properties["formula"];
//                 this.outputs[0].label = f;
//             }
//
//             onGetOutputs() {
//                 return [["A-B", "number"], ["A*B", "number"], ["A/B", "number"]];
//             }
//         }
//
// 		MathFormula.title = "Formula";
// 		MathFormula.desc = "Compute safe formula";
//
//         nodes.registerNodeType("math/formula", MathFormula);
// 	}
//
//
// 	class Math3DVec2ToXYZ {
//         constructor() {
//             this.addInput("vec2", "vec2");
//             this.addOutput("x", "number");
//             this.addOutput("y", "number");
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//
//             this.setOutputData(0, v[0]);
//             this.setOutputData(1, v[1]);
//         }
//     }
//
// 	Math3DVec2ToXYZ.title = "Vec2->XY";
// 	Math3DVec2ToXYZ.desc = "vector 2 to components";
//
//     nodes.registerNodeType("math3d/vec2-to-xyz", Math3DVec2ToXYZ);
//
//
// 	class Math3DXYToVec2 {
//         constructor() {
//             this.addInputs([["x", "number"], ["y", "number"]]);
//             this.addOutput("vec2", "vec2");
//             this.properties = {x: 0, y: 0};
//             this._data = new Float32Array(2);
//         }
//
//         onExecute() {
//             let x = this.getInputData(0);
//             if (x == null) x = this.properties.x;
//             let y = this.getInputData(1);
//             if (y == null) y = this.properties.y;
//
//             let data = this._data;
//             data[0] = x;
//             data[1] = y;
//
//             this.setOutputData(0, data);
//         }
//     }
//
// 	Math3DXYToVec2.title = "XY->Vec2";
// 	Math3DXYToVec2.desc = "components to vector2";
//
//     nodes.registerNodeType("math3d/xy-to-vec2", Math3DXYToVec2);
//
//
// 	class Math3DVec3ToXYZ {
//         constructor() {
//             this.addInput("vec3", "vec3");
//             this.addOutput("x", "number");
//             this.addOutput("y", "number");
//             this.addOutput("z", "number");
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//
//             this.setOutputData(0, v[0]);
//             this.setOutputData(1, v[1]);
//             this.setOutputData(2, v[2]);
//         }
//     }
//
// 	Math3DVec3ToXYZ.title = "Vec3->XYZ";
// 	Math3DVec3ToXYZ.desc = "vector 3 to components";
//
//     nodes.registerNodeType("math3d/vec3-to-xyz", Math3DVec3ToXYZ);
//
//
// 	class Math3DXYZToVec3 {
//         constructor() {
//             this.addInputs([["x", "number"], ["y", "number"], ["z", "number"]]);
//             this.addOutput("vec3", "vec3");
//             this.properties = {x: 0, y: 0, z: 0};
//             this._data = new Float32Array(3);
//         }
//
//         onExecute() {
//             let x = this.getInputData(0);
//             if (x == null) x = this.properties.x;
//             let y = this.getInputData(1);
//             if (y == null) y = this.properties.y;
//             let z = this.getInputData(2);
//             if (z == null) z = this.properties.z;
//
//             let data = this._data;
//             data[0] = x;
//             data[1] = y;
//             data[2] = z;
//
//             this.setOutputData(0, data);
//         }
//     }
//
// 	Math3DXYZToVec3.title = "XYZ->Vec3";
// 	Math3DXYZToVec3.desc = "components to vector3";
//
//     nodes.registerNodeType("math3d/xyz-to-vec3", Math3DXYZToVec3);
//
//
// 	class Math3DVec4ToXYZW {
//         constructor() {
//             this.addInput("vec4", "vec4");
//             this.addOutput("x", "number");
//             this.addOutput("y", "number");
//             this.addOutput("z", "number");
//             this.addOutput("w", "number");
//         }
//
//         onExecute() {
//             let v = this.getInputData(0);
//             if (v == null) return;
//
//             this.setOutputData(0, v[0]);
//             this.setOutputData(1, v[1]);
//             this.setOutputData(2, v[2]);
//             this.setOutputData(3, v[3]);
//         }
//     }
//
// 	Math3DVec4ToXYZW.title = "Vec4->XYZW";
// 	Math3DVec4ToXYZW.desc = "vector 4 to components";
//
//     nodes.registerNodeType("math3d/vec4-to-xyzw", Math3DVec4ToXYZW);
//
//
// 	class Math3DXYZWToVec4 {
//         constructor() {
//             this.addInputs([["x", "number"], ["y", "number"], ["z", "number"], ["w", "number"]]);
//             this.addOutput("vec4", "vec4");
//             this.properties = {x: 0, y: 0, z: 0, w: 0};
//             this._data = new Float32Array(4);
//         }
//
//         onExecute() {
//             let x = this.getInputData(0);
//             if (x == null) x = this.properties.x;
//             let y = this.getInputData(1);
//             if (y == null) y = this.properties.y;
//             let z = this.getInputData(2);
//             if (z == null) z = this.properties.z;
//             let w = this.getInputData(3);
//             if (w == null) w = this.properties.w;
//
//             let data = this._data;
//             data[0] = x;
//             data[1] = y;
//             data[2] = z;
//             data[3] = w;
//
//             this.setOutputData(0, data);
//         }
//     }
//
// 	Math3DXYZWToVec4.title = "XYZW->Vec4";
// 	Math3DXYZWToVec4.desc = "components to vector4";
//
//     nodes.registerNodeType("math3d/xyzw-to-vec4", Math3DXYZWToVec4);
//
//
// //if glMatrix is installed...
// 	if (global.glMatrix) {
//
//
// 		class Math3DRotation {
//             constructor() {
//                 this.addInputs([["degrees", "number"], ["axis", "vec3"]]);
//                 this.addOutput("quat", "quat");
//                 this.properties = {angle: 90.0, axis: vec3.fromValues(0, 1, 0)};
//             }
//
//             onExecute() {
//                 let angle = this.getInputData(0);
//                 if (angle == null) angle = this.properties.angle;
//                 let axis = this.getInputData(1);
//                 if (axis == null) axis = this.properties.axis;
//
//                 let R = quat.setAxisAngle(quat.create(), axis, angle * 0.0174532925);
//                 this.setOutputData(0, R);
//             }
//         }
//
// 		Math3DRotation.title = "Rotation";
// 		Math3DRotation.desc = "quaternion rotation";
//
//
//         nodes.registerNodeType("math3d/rotation", Math3DRotation);
//
//
// 		//Math3D rotate vec3
// 		class Math3DRotateVec3 {
//             constructor() {
//                 this.addInputs([["vec3", "vec3"], ["quat", "quat"]]);
//                 this.addOutput("result", "vec3");
//                 this.properties = {vec: [0, 0, 1]};
//             }
//
//             onExecute() {
//                 let vec = this.getInputData(0);
//                 if (vec == null) vec = this.properties.vec;
//                 let quat = this.getInputData(1);
//                 if (quat == null)
//                     this.setOutputData(vec);
//                 else
//                     this.setOutputData(0, vec3.transformQuat(vec3.create(), vec, quat));
//             }
//         }
//
// 		Math3DRotateVec3.title = "Rot. Vec3";
// 		Math3DRotateVec3.desc = "rotate a point";
//
//         nodes.registerNodeType("math3d/rotate_vec3", Math3DRotateVec3);
//
//
// 		class Math3DMultQuat {
//             constructor() {
//                 this.addInputs([["A", "quat"], ["B", "quat"]]);
//                 this.addOutput("A*B", "quat");
//             }
//
//             onExecute() {
//                 let A = this.getInputData(0);
//                 if (A == null) return;
//                 let B = this.getInputData(1);
//                 if (B == null) return;
//
//                 let R = quat.multiply(quat.create(), A, B);
//                 this.setOutputData(0, R);
//             }
//         }
//
// 		Math3DMultQuat.title = "Mult. Quat";
// 		Math3DMultQuat.desc = "rotate quaternion";
//
//         nodes.registerNodeType("math3d/mult-quat", Math3DMultQuat);
//
// 	} //glMatrix
//
// } 
//# sourceMappingURL=math.js.map