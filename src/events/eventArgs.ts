import {MessageSide} from "../utilities/enums";

export type Events = {
    'message': MessageEventArgs
    'image': ImageMessageEventArgs
}

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

export class ImageMessageEventArgs extends MessageEventArgs {
    images: string[];

    constructor(text: string, sender: string, group: string, from: MessageSide, images: string[]) {
        super(text, sender, group, from);
        this.images = images;
    }
}
