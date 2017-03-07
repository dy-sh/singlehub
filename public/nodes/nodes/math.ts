/**
 * Created by Derwish (derwish.pro@gmail.com) on 04.07.2016.
 */


import {Node} from "../node";
import {Container} from "../container";


class MathAbsNode extends Node {
    constructor() {
        super();

        this.title = "Abs";
        this.descriprion = "Returns the absolute value of a number.";

        this.addInput("x", "number");
        this.addOutput("abs(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.abs(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/abs", MathAbsNode);


class MathAcosNode extends Node {
    constructor() {
        super();

        this.title = "Acos";
        this.descriprion = "Returns the arccosine of a number.";

        this.addInput("x", "number");
        this.addOutput("acos(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.acos(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/acos", MathAcosNode);


class MathAsinNode extends Node {
    constructor() {
        super();

        this.title = "Asin";
        this.descriprion = "Returns the arcsine of a number.";

        this.addInput("x", "number");
        this.addOutput("asin(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.asin(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/asin", MathAsinNode);


class MathAtanNode extends Node {
    constructor() {
        super();

        this.title = "Atan";
        this.descriprion = "Returns the arctangent of a number.";

        this.addInput("x", "number");
        this.addOutput("atan(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.atan(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/atan", MathAtanNode);


class MathCbrtNode extends Node {
    constructor() {
        super();

        this.title = "Cbrt";
        this.descriprion = "Returns the cube root of a number.";

        this.addInput("x", "number");
        this.addOutput("cbrt(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.cbrt(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/cbrt", MathCbrtNode);


class MathCeilNode extends Node {
    constructor() {
        super();

        this.title = "Ceil";
        this.descriprion = "Returns the smallest integer greater than or equal to a number.";

        this.addInput("x", "number");
        this.addOutput("ceil(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.ceil(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/ceil", MathCeilNode);


class MathCosNode extends Node {
    constructor() {
        super();

        this.title = "Cos";
        this.descriprion = "Returns the cosine of a number.";

        this.addInput("x", "number");
        this.addOutput("cos(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.cos(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/cos", MathCosNode);




class MathDivideNode extends Node {
    constructor() {
        super();

        this.title = "Divide";
        this.descriprion = "This node divide one number by another.";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x/y", "number");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);
        let result = a / b;
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/divide", MathDivideNode);


class MathExpNode extends Node {
    constructor() {
        super();

        this.title = "Exp";
        this.descriprion = "Returns E pow x, where x is the argument, and E is Euler's constant (2.718…), the base of the natural logarithm.";

        this.addInput("x", "number");
        this.addOutput("exp(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.exp(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/exp", MathExpNode);


class MathFloorNode extends Node {
    constructor() {
        super();

        this.title = "Floor";
        this.descriprion = "Returns the largest integer less than or equal to a number.";

        this.addInput("x", "number");
        this.addOutput("floor(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.floor(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/floor", MathFloorNode);


class MathLogarithmNode extends Node {
    constructor() {
        super();

        this.title = "Logarithm";
        this.descriprion = "Returns the natural logarithm of a number.";

        this.addInput("x", "number");
        this.addOutput("log(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.log(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/logarithm", MathLogarithmNode);





class MathMinusNode extends Node {
    constructor() {
        super();

        this.title = "Minus";
        this.descriprion = "This node subtracts one number from another.";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x-y", "number");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);
        let result = a - b;
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/minus", MathMinusNode);

class MathModulusNode extends Node {
    constructor() {
        super();

        this.title = "Modulus";
        this.descriprion = "This node performs modulo operation (calculate the remainder after division of one number by another).";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x%y", "number");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);
        let result = a % b;
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/modulus", MathModulusNode);



class MathMultiplyNode extends Node {
    constructor() {
        super();

        this.title = "Multiply";
        this.descriprion = "This node multiplies one number by another.";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x*y", "number");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);
        let result = a - b;
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/multiply", MathMultiplyNode);



class MathPowNode extends Node {
    constructor() {
        super();

        this.title = "Pow";
        this.descriprion = "Returns base to the exponent power.";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x pow y", "number");
    }

    onInputUpdated() {
        let x = this.getInputData(0);
        let y = this.getInputData(1);
        let result = Math.pow(x, y);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/pow", MathPowNode);


class MathPlusNode extends Node {
    constructor() {
        super();

        this.title = "Plus";
        this.descriprion = "This node adds one number to another.";

        this.addInput("x", "number");
        this.addInput("y", "number");
        this.addOutput("x+y", "number");
    }

    onInputUpdated() {
        let a = this.getInputData(0);
        let b = this.getInputData(1);
        let result = a + b;
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/plus", MathPlusNode);


class MathRoundNode extends Node {
    constructor() {
        super();

        this.title = "Round";
        this.descriprion = "Returns the value of a number rounded to the nearest integer.";

        this.addInput("x", "number");
        this.addOutput("round(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.round(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/round", MathRoundNode);



class MathSignNode extends Node {
    constructor() {
        super();

        this.title = "Sign";
        this.descriprion = "Returns the sign of the x, indicating whether x is positive, negative or zero.";

        this.addInput("x", "number");
        this.addOutput("sign(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.sign(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/sign", MathSignNode);



class MathSinNode extends Node {
    constructor() {
        super();

        this.title = "Sin";
        this.descriprion = "Returns the sine of a number.";

        this.addInput("x", "number");
        this.addOutput("sin(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.sin(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/sin", MathSinNode);



class MathSqrtNode extends Node {
    constructor() {
        super();

        this.title = "Sqrt";
        this.descriprion = "Returns the positive square root of a number.";

        this.addInput("x", "number");
        this.addOutput("sqrt(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.sqrt(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/sqrt", MathSqrtNode);



class MathTanNode extends Node {
    constructor() {
        super();

        this.title = "Tan";
        this.descriprion = "Returns the tangent of a number.";

        this.addInput("x", "number");
        this.addOutput("tan(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.tan(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/tan", MathTanNode);



class MathTruncNode extends Node {
    constructor() {
        super();

        this.title = "Trunc";
        this.descriprion = "Returns the integral part of the number x, removing any fractional digits.";

        this.addInput("x", "number");
        this.addOutput("trunc(x)", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        let result = Math.trunc(val);
        this.setOutputData(0, result);
    }
}
Container.registerNodeType("math/trunc", MathTruncNode);

