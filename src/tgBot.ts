import TelegramBot, {InputMediaPhoto} from "node-telegram-bot-api";
import * as Messages from './messages';
import {eventBus} from "./events/eventBus";
import {ImageMessageEventArgs, MessageEventArgs} from "./events/eventArgs";
import {MessageSide} from "./utilities/enums";
import {Config} from "./config";
import path from "path";
import * as fs from "fs";
import {mkdirs} from "./utilities/files";

export class TGBot {
    private bot: TelegramBot;
    private startDate: number;

    private dir: string;

    constructor(token: string, proxy: string, dir: string) {
        this.bot = new TelegramBot(token, {
            polling: true,
            // @ts-ignore
            request: {
                // url: '',
                proxy: proxy
            }
        });

        this.dir = dir;
        this.startDate = new Date().getTime();

        this.bot.onText(/\/echo/, (msg, match) => this.onEcho(msg, match));
        this.bot.onText(/\/whoami/, (msg, match) => this.onWhoami(msg, match));

        this.bot.on('text', (msg, match) => this.onText(msg, match));
        this.bot.on('photo', (msg, match) => this.onPhoto(msg, match));
    }

    private async onEcho(msg: TelegramBot.Message, match: RegExpExecArray | null) {
        let chatId = msg.chat.id;
        let msgId = msg.message_id;

        let content = msg.text?.slice(6, msg.text?.length) + '';

        await this.sendMessage(chatId, content, undefined, { reply_to_message_id: msgId });
    }

    private async onWhoami(msg: TelegramBot.Message, match: RegExpExecArray | null) {
        let chatId = msg.chat.id;
        let msgId = msg.message_id;

        let bot = this.bot;

        let botId = (await bot.getMe()).id + '';
        let senderId = msg.from?.id + '';

        let content = Messages.Whoami(chatId + '', senderId, botId)

        await this.sendMessage(chatId, content, undefined, { reply_to_message_id: msgId, parse_mode: "MarkdownV2" });
    }

    private async onText(msg: TelegramBot.Message, metadata: TelegramBot.Metadata): Promise<void> {
        if ((msg.date - 1) * 1000 < this.startDate) {
            return;
        }

        let lastName = msg.from?.last_name ? " " + msg.from?.last_name : "";
        let senderName = msg.from?.first_name + lastName;

        let args = new MessageEventArgs(msg.text + "", senderName, msg.chat.id + "", MessageSide.TG);
        eventBus.fire('message', args);
    }

    private async onPhoto(msg: TelegramBot.Message, metadata: TelegramBot.Metadata): Promise<void>  {
        if ((msg.date - 1) * 1000 < this.startDate) {
            return;
        }

        let lastName = msg.from?.last_name ? " " + msg.from?.last_name : "";
        let senderName = msg.from?.first_name + lastName;

        if (!msg.photo) {
            await this.onText(msg, metadata);
            return;
        }

        let images = [];
        for await (const photo of msg.photo!) {
            mkdirs(path.resolve(this.dir, 'cache', 'images'));

            let file = await this.bot.downloadFile(photo.file_id, path.resolve(this.dir, 'cache', 'images'));
            images.push(file);
        }

        let args = new ImageMessageEventArgs(msg.caption + "", senderName, msg.chat.id + "", MessageSide.TG, images);
        eventBus.fire('image', args);
    }

    public async sendMessage(chatId: string | number, content: string, images?: string[], options?: TelegramBot.SendMessageOptions): Promise<void> {
        await this.sendMessageInternal(chatId, content, 5, 0, images, options);
    }

    private async sendMessageInternal(chatId: string | number, content: string,
                                      maxTries: number, tries: number, images?: string[], options?: TelegramBot.SendMessageOptions): Promise<void> {
        if (tries > maxTries) {
            console.log(`Send failed!\nTo: ${chatId}\nContent: ${content}\nWith options: ${options}`);
            return;
        }

        if (images) {
            let medias: InputMediaPhoto[] = [];
            for (const image of images) {
                medias.push({
                    type: 'photo',
                    media: image,
                    caption: content
                });
            }

            await this.bot.sendMediaGroup(chatId, medias).catch(err => {
                if (Config.dev) {
                    console.log(err);
                }

                this.sendMessageInternal(chatId, content, maxTries, tries + 1, images, options);
            });
        } else {
            await this.bot.sendMessage(chatId, content, options).catch(err => {
                if (Config.dev) {
                    console.log(err);
                }

                this.sendMessageInternal(chatId, content, maxTries, tries + 1, images, options);
            });
        }
    }
}
