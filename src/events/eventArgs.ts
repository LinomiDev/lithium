import {MessageSide} from "../utilities/enums";

export class EventArgs {

}

export class MessageEventArgs extends EventArgs {
    text: string;
    sender: string;

    group: string;

    fromSide: MessageSide;

    constructor(text: string, sender: string, group: string, from: MessageSide) {
        super();
        this.text = text;
        this.sender = sender;
        this.group = group;
        this.fromSide = from;
    }
}
