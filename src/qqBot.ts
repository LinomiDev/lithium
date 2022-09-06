import {Client, createClient, GroupInviteEvent, GroupMessageEvent, Platform, segment} from "oicq";
import {eventBus} from "./events/eventBus";
import {ImageMessageEventArgs, MessageEventArgs} from "./events/eventArgs";
import {MessageSide} from "./utilities/enums";
import path from "path";
import Downloader from "nodejs-file-downloader";
import {MessageElem} from "oicq/lib/message/elements";

export class QQBot {
    private client: Client;

    private dir: string;

    constructor(account: string, dir: string) {
        this.client = createClient(+account, {
            data_dir: dir,
            platform: Platform.iPad
        });

        this.dir = dir;

        this.client.on('message.group', event => this.onGroupMessage(event));
        this.client.on('request.group.invite', event => this.onGroupInvite(event));
    }

    public async login(password?: string) {
        if (password) {
            await this.loginWithPass(password);
        } else {
            await this.loginWithQRCode();
        }
    }

    private async loginWithPass(pass: string) {
        await this.client.on('system.login.slider', function(event) {
            console.log('Please key-in Ticket: ');

            process.stdin.once('data', data => {
                this.submitSlider(String(data).trim());
            });
        }).login(pass);
    }

    private async loginWithQRCode() {
        await this.client.on('system.login.qrcode', function(event) {
            console.log('Please press Enter after scan the QRCode.');

            process.stdin.once('data', () => {
                this.login();
            });
        }).login();
    }

    private async onGroupMessage(event: GroupMessageEvent) {
        let groupId = event.group.group_id + "";

        let text = '';

        let hasImages = false;
        let images = [];

        for (const message of event.message) {
            if (message.type == 'text' || message.type == 'at') {
                text += message.text;
            }

            if (message.type == 'image') {
                hasImages = true;
                let result = await this.downloadImage(message.url + "");
                images.push(result);
            }
        }

        if (!hasImages) {
            let args = new MessageEventArgs(text, event.sender.nickname,
                groupId, MessageSide.QQ);

            eventBus.fire('message', args);
        } else if (hasImages) {
            let args = new ImageMessageEventArgs(text, event.sender.nickname,
                groupId, MessageSide.QQ, images);

            eventBus.fire('image', args);
        }
    }

    private async downloadImage(url: string): Promise<string> {
        let downloader = await new Downloader({
            url: url,
            directory: path.join(this.dir, 'cache', 'images')
        }).download();

        return downloader.filePath + '';
    }

    private async onGroupInvite(event: GroupInviteEvent) {
        await event.approve(true);
    }

    public async sendGroupMessage(group: number, message: string) {
        await this.client.sendGroupMsg(group, message);
    }

    public async sendGroupMessageWithImages(group: number, message: string, images: string[]) {
        let imageSegment = [];
        for (const image of images) {
            imageSegment.push(segment.image(image));
        }
        imageSegment.push(message);

        await this.client.sendGroupMsg(group, imageSegment);
    }
}
