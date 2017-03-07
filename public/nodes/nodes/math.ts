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

        if (val != null)
            this.setOutputData(0, Math.abs(val));
        else
            this.setOutputData(0, null);
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

        if (val != null)
            this.setOutputData(0, Math.acos(val));
        else
            this.setOutputData(0, null);
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

        if (val != null)
            this.setOutputData(0, Math.asin(val));
        else
            this.setOutputData(0, null);
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

        if (val != null)
            this.setOutputData(0, Math.atan(val));
        else
            this.setOutputData(0, null);
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

        if (val != null)
            this.setOutputData(0, Math.cbrt(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.ceil(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.cos(val));
        else
            this.setOutputData(0, null);
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

        if (a != null && b != null)
            this.setOutputData(0, a / b);
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.exp(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.floor(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.log(val));
        else
            this.setOutputData(0, null);
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

        if (a != null && b != null)
            this.setOutputData(0, a - b);
        else
            this.setOutputData(0, null);
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

        if (a != null && b != null)
            this.setOutputData(0, a % b);
        else
            this.setOutputData(0, null);
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

        if (a != null && b != null)
            this.setOutputData(0, a * b);
        else
            this.setOutputData(0, null);
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

        if (x != null && y != null)
            this.setOutputData(0, Math.pow(x,y));
        else
            this.setOutputData(0, null);
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

        if (a != null && b != null)
            this.setOutputData(0, a + b);
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.round(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.sign(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.sin(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.sqrt(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.tan(val));
        else
            this.setOutputData(0, null);
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
        if (val != null)
            this.setOutputData(0, Math.trunc(val));
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("math/trunc", MathTruncNode);

