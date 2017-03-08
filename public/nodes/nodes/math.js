/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var node_1 = require("../node");
var container_1 = require("../container");
var MathAbsNode = (function (_super) {
    __extends(MathAbsNode, _super);
    function MathAbsNode() {
        _super.call(this);
        this.title = "Abs";
        this.descriprion = "Returns the absolute value of a number.";
        this.addInput("x", "number");
        this.addOutput("abs(x)", "number");
    }
    MathAbsNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.abs(val));
        else
            this.setOutputData(0, null);
    };
    return MathAbsNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/abs", MathAbsNode);
var MathAcosNode = (function (_super) {
    __extends(MathAcosNode, _super);
    function MathAcosNode() {
        _super.call(this);
        this.title = "Acos";
        this.descriprion = "Returns the arccosine of a number.";
        this.addInput("x", "number");
        this.addOutput("acos(x)", "number");
    }
    MathAcosNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.acos(val));
        else
            this.setOutputData(0, null);
    };
    return MathAcosNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/acos", MathAcosNode);
var MathAsinNode = (function (_super) {
    __extends(MathAsinNode, _super);
    function MathAsinNode() {
        _super.call(this);
        this.title = "Asin";
        this.descriprion = "Returns the arcsine of a number.";
        this.addInput("x", "number");
        this.addOutput("asin(x)", "number");
    }
    MathAsinNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.asin(val));
        else
            this.setOutputData(0, null);
    };
    return MathAsinNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/asin", MathAsinNode);
var MathAtanNode = (function (_super) {
    __extends(MathAtanNode, _super);
    function MathAtanNode() {
        _super.call(this);
        this.title = "Atan";
        this.descriprion = "Returns the arctangent of a number.";
        this.addInput("x", "number");
        this.addOutput("atan(x)", "number");
    }
    MathAtanNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.atan(val));
        else
            this.setOutputData(0, null);
    };
    return MathAtanNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/atan", MathAtanNode);
var MathCbrtNode = (function (_super) {
    __extends(MathCbrtNode, _super);
    function MathCbrtNode() {
        _super.call(this);
        this.title = "Cbrt";
        this.descriprion = "Returns the cube root of a number.";
        this.addInput("x", "number");
        this.addOutput("cbrt(x)", "number");
    }
    MathCbrtNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.cbrt(val));
        else
            this.setOutputData(0, null);
    };
    return MathCbrtNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/cbrt", MathCbrtNode);
var MathCeilNode = (function (_super) {
    __extends(MathCeilNode, _super);
    function MathCeilNode() {
        _super.call(this);
        this.title = "Ceil";
        this.descriprion = "Returns the smallest integer greater than or equal to a number.";
        this.addInput("x", "number");
        this.addOutput("ceil(x)", "number");
    }
    MathCeilNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.ceil(val));
        else
            this.setOutputData(0, null);
    };
    return MathCeilNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/ceil", MathCeilNode);
var MathCosNode = (function (_super) {
    __extends(MathCosNode, _super);
    function MathCosNode() {
        _super.call(this);
        this.title = "Cos";
        this.descriprion = "Returns the cosine of a number.";
        this.addInput("x", "number");
        this.addOutput("cos(x)", "number");
    }
    MathCosNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.cos(val));
        else
            this.setOutputData(0, null);
    };
    return MathCosNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/cos", MathCosNode);
var MathDivideNode = (function (_super) {
    __extends(MathDivideNode, _super);
    function MathDivideNode() {
        _super.call(this);
        this.title = "Divide";
        this.descriprion = "This node divide one number by another.";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x/y", "number");
    }
    MathDivideNode.prototype.onInputUpdated = function () {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (a != null && b != null)
            this.setOutputData(0, a / b);
        else
            this.setOutputData(0, null);
    };
    return MathDivideNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/divide", MathDivideNode);
var MathExpNode = (function (_super) {
    __extends(MathExpNode, _super);
    function MathExpNode() {
        _super.call(this);
        this.title = "Exp";
        this.descriprion = "Returns E pow x, where x is the argument, and E is Euler's constant (2.718…), the base of the natural logarithm.";
        this.addInput("x", "number");
        this.addOutput("exp(x)", "number");
    }
    MathExpNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.exp(val));
        else
            this.setOutputData(0, null);
    };
    return MathExpNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/exp", MathExpNode);
var MathFloorNode = (function (_super) {
    __extends(MathFloorNode, _super);
    function MathFloorNode() {
        _super.call(this);
        this.title = "Floor";
        this.descriprion = "Returns the largest integer less than or equal to a number.";
        this.addInput("x", "number");
        this.addOutput("floor(x)", "number");
    }
    MathFloorNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.floor(val));
        else
            this.setOutputData(0, null);
    };
    return MathFloorNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/floor", MathFloorNode);
var MathLogarithmNode = (function (_super) {
    __extends(MathLogarithmNode, _super);
    function MathLogarithmNode() {
        _super.call(this);
        this.title = "Logarithm";
        this.descriprion = "Returns the natural logarithm of a number.";
        this.addInput("x", "number");
        this.addOutput("log(x)", "number");
    }
    MathLogarithmNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.log(val));
        else
            this.setOutputData(0, null);
    };
    return MathLogarithmNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/logarithm", MathLogarithmNode);
var MathMinusNode = (function (_super) {
    __extends(MathMinusNode, _super);
    function MathMinusNode() {
        _super.call(this);
        this.title = "Minus";
        this.descriprion = "This node subtracts one number from another.";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x-y", "number");
    }
    MathMinusNode.prototype.onInputUpdated = function () {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (a != null && b != null)
            this.setOutputData(0, a - b);
        else
            this.setOutputData(0, null);
    };
    return MathMinusNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/minus", MathMinusNode);
var MathModulusNode = (function (_super) {
    __extends(MathModulusNode, _super);
    function MathModulusNode() {
        _super.call(this);
        this.title = "Modulus";
        this.descriprion = "This node performs modulo operation (calculate the remainder after division of one number by another).";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x%y", "number");
    }
    MathModulusNode.prototype.onInputUpdated = function () {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (a != null && b != null)
            this.setOutputData(0, a % b);
        else
            this.setOutputData(0, null);
    };
    return MathModulusNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/modulus", MathModulusNode);
var MathMultiplyNode = (function (_super) {
    __extends(MathMultiplyNode, _super);
    function MathMultiplyNode() {
        _super.call(this);
        this.title = "Multiply";
        this.descriprion = "This node multiplies one number by another.";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x*y", "number");
    }
    MathMultiplyNode.prototype.onInputUpdated = function () {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (a != null && b != null)
            this.setOutputData(0, a * b);
        else
            this.setOutputData(0, null);
    };
    return MathMultiplyNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/multiply", MathMultiplyNode);
var MathPowNode = (function (_super) {
    __extends(MathPowNode, _super);
    function MathPowNode() {
        _super.call(this);
        this.title = "Pow";
        this.descriprion = "Returns base to the exponent power.";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x pow y", "number");
    }
    MathPowNode.prototype.onInputUpdated = function () {
        var x = this.getInputData(0);
        var y = this.getInputData(1);
        if (x != null && y != null)
            this.setOutputData(0, Math.pow(x, y));
        else
            this.setOutputData(0, null);
    };
    return MathPowNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/pow", MathPowNode);
var MathPlusNode = (function (_super) {
    __extends(MathPlusNode, _super);
    function MathPlusNode() {
        _super.call(this);
        this.title = "Plus";
        this.descriprion = "This node adds one number to another.";
        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x+y", "number");
    }
    MathPlusNode.prototype.onInputUpdated = function () {
        var a = this.getInputData(0);
        var b = this.getInputData(1);
        if (a != null && b != null)
            this.setOutputData(0, a + b);
        else
            this.setOutputData(0, null);
    };
    return MathPlusNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/plus", MathPlusNode);
var MathRoundNode = (function (_super) {
    __extends(MathRoundNode, _super);
    function MathRoundNode() {
        _super.call(this);
        this.title = "Round";
        this.descriprion = "Returns the value of a number rounded to the nearest integer.";
        this.addInput("x", "number");
        this.addOutput("round(x)", "number");
    }
    MathRoundNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.round(val));
        else
            this.setOutputData(0, null);
    };
    return MathRoundNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/round", MathRoundNode);
var MathSignNode = (function (_super) {
    __extends(MathSignNode, _super);
    function MathSignNode() {
        _super.call(this);
        this.title = "Sign";
        this.descriprion = "Returns the sign of the x, indicating whether x is positive, negative or zero.";
        this.addInput("x", "number");
        this.addOutput("sign(x)", "number");
    }
    MathSignNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.sign(val));
        else
            this.setOutputData(0, null);
    };
    return MathSignNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/sign", MathSignNode);
var MathSinNode = (function (_super) {
    __extends(MathSinNode, _super);
    function MathSinNode() {
        _super.call(this);
        this.title = "Sin";
        this.descriprion = "Returns the sine of a number.";
        this.addInput("x", "number");
        this.addOutput("sin(x)", "number");
    }
    MathSinNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.sin(val));
        else
            this.setOutputData(0, null);
    };
    return MathSinNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/sin", MathSinNode);
var MathSqrtNode = (function (_super) {
    __extends(MathSqrtNode, _super);
    function MathSqrtNode() {
        _super.call(this);
        this.title = "Sqrt";
        this.descriprion = "Returns the positive square root of a number.";
        this.addInput("x", "number");
        this.addOutput("sqrt(x)", "number");
    }
    MathSqrtNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.sqrt(val));
        else
            this.setOutputData(0, null);
    };
    return MathSqrtNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/sqrt", MathSqrtNode);
var MathTanNode = (function (_super) {
    __extends(MathTanNode, _super);
    function MathTanNode() {
        _super.call(this);
        this.title = "Tan";
        this.descriprion = "Returns the tangent of a number.";
        this.addInput("x", "number");
        this.addOutput("tan(x)", "number");
    }
    MathTanNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.tan(val));
        else
            this.setOutputData(0, null);
    };
    return MathTanNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/tan", MathTanNode);
var MathTruncNode = (function (_super) {
    __extends(MathTruncNode, _super);
    function MathTruncNode() {
        _super.call(this);
        this.title = "Trunc";
        this.descriprion = "Returns the integral part of the number x, removing any fractional digits.";
        this.addInput("x", "number");
        this.addOutput("trunc(x)", "number");
    }
    MathTruncNode.prototype.onInputUpdated = function () {
        var val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, Math.trunc(val));
        else
            this.setOutputData(0, null);
    };
    return MathTruncNode;
}(node_1.Node));
container_1.Container.registerNodeType("math/trunc", MathTruncNode);
