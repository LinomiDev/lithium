import {Config} from "./config";
import {TGBot} from "./tgBot";
import {eventBus} from "./events/eventBus";
import {QQBot} from "./qqBot";
import {MessageSide} from "./utilities/enums";

console.log('Initializing Lithium.');
console.log('Logging into Telegram.');
const tgBot = new TGBot(Config.tgToken, Config.proxy);

console.log('Logging into QQ.');
const qqBot = new QQBot(Config.qqUid);
qqBot.login(Config.qqPass);

eventBus.register('message', args => {
    if (args.fromSide == MessageSide.QQ) {
        let tgGroup = Config.forwardsQQ2TG.get(args.group);

        if (tgGroup) {
            let text = `${args.sender}:\n${args.text}`;
            tgBot.sendMessage(tgGroup, text);
        }
    }

    if (args.fromSide == MessageSide.TG) {
        let qqGroup = Config.forwardsTG2QQ.get(args.group);

        if (qqGroup) {
            let text = `${args.sender}: ${args.text}`;
            qqBot.sendGroupMessage(+qqGroup, text);
        }
    }
});

// Todo: better log.
// eventBus.register('message', args => {
//     console.log(args instanceof MessageEventArgs);
// });
//
// eventBus.fire('message', new MessageEventArgs());
