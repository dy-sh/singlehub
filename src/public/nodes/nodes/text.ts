/**
 * Created by Derwish (derwish.pro@gmail.com) on 08.03.17.
 * License: http://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Node } from "../node";
import { Container } from "../container";
import Utils from "../utils";


class TextStringLengthNode extends Node {
    constructor() {
        super();

        this.title = "String length";
        this.descriprion = "This node counts the number of characters in the given text string.";

        this.addInput("text", "string");
        this.addOutput("length", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);
        if (val != null)
            this.setOutputData(0, val.length);
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/string-length", TextStringLengthNode);


class TextASCIICodeNode extends Node {
    constructor() {
        super();

        this.title = "ASCII Code";
        this.descriprion = "This node generates ASCII code from the symbol.";

        this.addInput("char", "string");
        this.addOutput("code", "number");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val != null)
            this.setOutputData(0, val.charCodeAt(0));
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/ascii-code", TextASCIICodeNode);


class TextASCIICharNode extends Node {
    constructor() {
        super();

        this.title = "ASCII Code";
        this.descriprion = "This node generates symbol from the ASCII code.";

        this.addInput("code", "number");
        this.addOutput("char", "string");
    }

    onInputUpdated() {
        let val = this.getInputData(0);

        if (val != null)
            this.setOutputData(0, String.fromCharCode(val));
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/ascii-char", TextASCIICharNode);


class TextCharAtIndexNode extends Node {
    constructor() {
        super();

        this.title = "Char at index";
        this.descriprion = "This node takes the character from a text string at the specified index (position).";

        this.addInput("text", "string");
        this.addInput("index", "number");
        this.addOutput("char", "string");
    }

    onInputUpdated() {
        let text = this.getInputData(0);
        let index = this.getInputData(1);

        if (text != null && index != null)
            this.setOutputData(0, text[index]);
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/char-at-index", TextCharAtIndexNode);


class TextCutSubstringNode extends Node {
    constructor() {
        super();

        this.title = "Cut substring";
        this.descriprion = "Cuts out a substring from a text string. <br/>" +
            "You can specify a starting position from which to begin cutting, and length.";

        this.addInput("text", "string");
        this.addInput("start", "number");
        this.addInput("length", "number");
        this.addOutput("text", "string");
    }

    onInputUpdated() {
        let text = this.getInputData(0);
        let start = this.getInputData(1);
        let length = this.getInputData(2);

        if (text != null && start != null && length != null)
            this.setOutputData(0, text.substr(start, length));
        else
            this.setOutputData(0, null);
    }
}
Container.registerNodeType("text/cut-substring", TextCutSubstringNode);




class TextSplitStringsNode extends Node {
    currentIndex = 0;

    constructor() {
        super();

        this.title = "Split strings";
        this.descriprion = "This node splits the text into several strings using the separator. <br/>" +
            "Send \"1\" to \"Start\" to begin the separation. The incoming string is stored. " +
            "Next send \"1\" to \"Next\" to get the next line. <br/>" +
            "The result strings are sequentially sent to the output named \"Text\". " +
            "The output named \"Left\" reports how many strings are left.";

        this.addInput("text", "string");
        this.addInput("separator", "string");
        this.addInput("start", "boolean");
        this.addInput("next", "boolean");
        this.addInput("reset", "boolean");
        this.addOutput("text", "string");
        this.addOutput("left", "number");

        this.setOutputData(1, 0);
    }

    onInputUpdated() {
        if (this.inputs[2].updated && this.inputs[2].data) {
            this.currentIndex = 0;
            this.splitNext();
        }

        if (this.inputs[3].updated && this.inputs[3].data)
            this.splitNext();

        if (this.inputs[4].updated && this.inputs[4].data)
            this.reset();
    }

    splitNext() {
        let text = this.getInputData(0);
        let separator = this.getInputData(1);
        if (text == null || separator == null)
            return;

        let splittedText = text.split(separator);
        if (this.currentIndex >= splittedText.length)
            return;

        this.setOutputData(0, splittedText[this.currentIndex]);
        this.setOutputData(1, splittedText.length - this.currentIndex - 1);

        this.currentIndex++;
    }


    reset() {
        this.currentIndex = 0;
        this.setOutputData(0, null);
        this.setOutputData(1, 0);
    }
}
Container.registerNodeType("text/split-strings", TextSplitStringsNode);
