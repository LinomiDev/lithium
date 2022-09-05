import {Client, createClient, GroupInviteEvent, GroupMessageEvent} from "oicq";
import {eventBus} from "./events/eventBus";
import {MessageEventArgs} from "./events/eventArgs";
import {MessageSide} from "./utilities/enums";

export class QQBot {
    private client: Client;

    constructor(account: string) {
        this.client = createClient(+account, {
            data_dir: '../data/qq/'
        });

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
        let message = new MessageEventArgs(event.raw_message, event.sender.nickname,
            event.group.group_id + "", MessageSide.QQ);
        eventBus.fire('message', message);
    }

    private async onGroupInvite(event: GroupInviteEvent) {
        event.approve(true);
    }

    public async sendGroupMessage(group: number, message: string) {
        await this.client.sendGroupMsg(group, message);
    }
}
