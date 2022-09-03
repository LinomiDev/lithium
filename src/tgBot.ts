import TelegramBot from "node-telegram-bot-api";
import * as Messages from './messages';
import {eventBus} from "./events/eventBus";
import {MessageEventArgs} from "./events/eventArgs";
import {MessageSide} from "./utilities/enums";

export class TGBot {
    bot: TelegramBot;

    constructor(token: string, proxy: string) {
        this.bot = new TelegramBot(token, {
            polling: true,
            // @ts-ignore
            request: {
                // url: '',
                proxy: proxy
            }
        });

        this.bot.onText(/\/echo/, (msg, match) => this.onEcho(msg, match));
        this.bot.onText(/\/whoami/, (msg, match) => this.onWhoami(msg, match));

        this.bot.on('text', (msg, match) => this.onText(msg, match));
        this.bot.on('photo', (msg, match) => this.onPhoto(msg, match));
    }

    private async onEcho(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
        let chatId = msg.chat.id;
        let msgId = msg.message_id;

        let content = msg.text?.slice(6, msg.text?.length) + '';

        await this.sendMessage(chatId, content, { reply_to_message_id: msgId });
    }

    private async onWhoami(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
        let chatId = msg.chat.id;
        let msgId = msg.message_id;

        let bot = this.bot;

        let botId = (await bot.getMe()).id + '';
        let senderId = msg.from?.id + '';

        let content = Messages.Whoami(chatId + '', senderId, botId)

        await this.sendMessage(chatId, content, { reply_to_message_id: msgId });
    }

    private onText(msg: TelegramBot.Message, metadata: TelegramBot.Metadata): void {
        let lastName = msg.from?.last_name ? " " + msg.from?.last_name : "";
        let senderName = msg.from?.first_name + lastName;

        let args = new MessageEventArgs(msg.text + "", senderName, msg.chat.id + "", MessageSide.TG);
        eventBus.fire('message', args);
    }

    private onPhoto(msg: TelegramBot.Message, metadata: TelegramBot.Metadata): void {
        let lastName = msg.from?.last_name ? " " + msg.from?.last_name : "";
        let senderName = msg.from?.first_name + lastName;

        let args = new MessageEventArgs(msg.text + "", senderName, msg.chat.id + "", MessageSide.TG);
        eventBus.fire('message', args);
    }


    public async sendMessage(chatId: string | number, content: string, options?: TelegramBot.SendMessageOptions): Promise<void> {
        await this.sendMessageInternal(chatId, content, 5, 0, options);
    }

    private async sendMessageInternal(chatId: string | number, content: string,
                                      maxTries: number, tries: number, options?: TelegramBot.SendMessageOptions): Promise<void> {
        if (tries > maxTries) {
            console.log(`Send failed!\nTo: ${chatId}\nContent: ${content}\nWith options: ${options}`);
            return;
        }

        await this.bot.sendMessage(chatId, content, options).catch(err => {
            console.log(err);
            this.sendMessageInternal(chatId, content, maxTries, tries + 1, options);
        })
    }
}
