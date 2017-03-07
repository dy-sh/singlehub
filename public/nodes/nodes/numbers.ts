/**
 * Created by Derwish (derwish.pro@gmail.com) on 05.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */


import {Node} from "../node";
import {Container} from "../container";
import Utils from "../utils";


class Random01Node extends Node {
    constructor() {
        super();

        this.title = "Random 0-1";
        this.descriprion = "Returns a random number between 0 and 1.";

        this.settings["digits"] = {description: "Number of digits after the decimal point", type: "number", value: 3};

        this.addInput("generate", "boolean");
        this.addOutput("random", "number");
    }

    onInputUpdated() {
        let gen = this.getInputData(0);

        if (gen) {
            let digits = this.settings["digits"].value;
            let result = Math.random();
            result = Utils.toFixedNumber(result, digits);
            this.setOutputData(0, result);
        }
    }
}
Container.registerNodeType("numbers/random01", Random01Node);


class RandomNode extends Node {
    constructor() {
        super();

        this.title = "Random";
        this.descriprion = "Returns a random number between Min and Max.";

        this.settings["digits"] = {description: "Number of digits after the decimal point", type: "number", value: 3};

        this.addInput("min", "number");
        this.addInput("max", "number");
        this.addInput("generate", "boolean");
        this.addOutput("random", "number");
    }

    onInputUpdated() {
        let gen = this.getInputData(2);

        if (gen) {
            let min = this.getInputData(0);
            let max = this.getInputData(1);

            let digits = this.settings["digits"].value;
            let result = (Math.random() * (max - min) + min);
            result = Utils.toFixedNumber(result, digits);
            this.setOutputData(0, result);
        }
    }
}
Container.registerNodeType("numbers/random", RandomNode);


class NumbersHighestNode extends Node {
    val: number;

    constructor() {
        super();

        this.title = "Highest";
        this.descriprion = "Remembers the highest value at the input.";

        this.addInput("value", "number");
        this.addInput("reset", "boolean");
        this.addOutput("highest", "number");
    }

    onInputUpdated() {
        if (this.getInputData(1) == true) {
            this.val = null;
            this.setOutputData(0, this.val);
            return;
        }

        let inputVal = this.getInputData(0);

        if (this.val == null || this.val < inputVal) {
            this.val = inputVal;
            this.setOutputData(0, this.val);
        }

    }
}
Container.registerNodeType("numbers/highest", NumbersHighestNode);


class NumbersLowestNode extends Node {
    val: number;

    constructor() {
        super();

        this.title = "Lowest";
        this.descriprion = "Remembers the lowest value at the input.";

        this.addInput("value", "number");
        this.addInput("reset", "boolean");
        this.addOutput("lowest", "number");
    }

    onInputUpdated() {
        if (this.getInputData(1) == true) {
            this.val = null;
            this.setOutputData(0, this.val);
            return;
        }

        let inputVal = this.getInputData(0);

        if (this.val == null || this.val > inputVal) {
            this.val = inputVal;
            this.setOutputData(0, this.val);
        }

    }
}
Container.registerNodeType("numbers/lowest", NumbersLowestNode);


class NumbersAverageNode extends Node {
    values = [];

    constructor() {
        super();

        this.title = "Average";
        this.descriprion = "This node calculates an average value from all input values. <br/>" +
            "To reset node, send logical \"1\" to input named \"Reset\"";

        this.addInput("value", "number");
        this.addInput("reset", "boolean");
        this.addOutput("average", "number");
    }

    onInputUpdated() {
        if (this.getInputData(1) == true) {
            this.values = [];
            this.setOutputData(0, null);
            return;
        }

        let val = this.getInputData(0);
        if (val == null)
            return;

        this.values.push(val);

        let sum = this.values.reduce(function (a, b) {
            return a + b;
        });
        let avg = sum / this.values.length;

        this.setOutputData(0, avg);

    }
}
Container.registerNodeType("numbers/average", NumbersAverageNode);


class NumbersSumNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Sum";
        this.descriprion = "This node calculates sum of all incoming values. <br/>" +
            "The internal counter can be overridden by the input named \"Set Value\". <br/>" +
            "To reset node, send logical \"1\" to input named \"Reset\"";

        this.addInput("add value", "number");
        this.addInput("set value", "number");
        this.addInput("reset", "boolean");
        this.addOutput("sum", "number");
    }

    onInputUpdated() {
        let old = this.outputs[0].data;

        if (this.inputs[2].updated && this.inputs[2].data==true)
            this.val = 0;

        else if (this.inputs[1].updated)
            this.val = this.inputs[1].data;

        else if (this.inputs[0].updated)
            this.val += this.inputs[0].data;


        if (this.val !== old)
            this.setOutputData(0, this.val);
    }
}
Container.registerNodeType("numbers/sum", NumbersSumNode);


class NumbersClampNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Clamp";
        this.descriprion = "This node limits the value to the specified range. <br/>" +
            "For example, Min=3, Max=5. <br/>" +
            "Now, if the \"Value\" input is 1, the output will be 3. <br/>" +
            "If the value is 6, the output will be 5. <br/>" +
            "If the value is 2.5, the output will be 2.5. <br/>";

        this.addInput("value", "number");
        this.addInput("min", "number");
        this.addInput("max", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let min = this.getInputData(1);
        let max = this.getInputData(2);

        if (val == null || min == null || max == null)
            val = null;
        else
            val = Utils.clamp(val, min, max);

        this.setOutputData(0, val);
    }
}
Container.registerNodeType("numbers/clamp", NumbersClampNode);


class NumbersRemapNode extends Node {
    val = 0;

    constructor() {
        super();

        this.title = "Remap";
        this.descriprion = "This node remaps a number. <br/>" +
            "For example, in-min=1, in-max=100, out-min=10, out-max=20. <br/>" +
            "If the Value is 1, Out is 10. <br/>" +
            "If the Value is 100, Out is 20. <br/>" +
            "If the Value is 50, Out is 20. <br/>";

        this.addInput("value", "number");
        this.addInput("in-min", "number");
        this.addInput("in-max", "number");
        this.addInput("out-min", "number");
        this.addInput("out-max", "number");
        this.addOutput("value", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let inMin = this.getInputData(1);
        let inMax = this.getInputData(2);
        let outMin = this.getInputData(3);
        let outMax = this.getInputData(4);

        if (val == null || inMin == null || inMax == null || outMin == null || outMax == null)
            val = null;
        else
            val = Utils.remap(val, inMin, inMax, outMin, outMax);

        this.setOutputData(0, val);
    }
}
Container.registerNodeType("numbers/remap", NumbersRemapNode);




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
// //Math MathSmoothStep
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
//             if (inc != null)
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