import dotenv from 'dotenv';

class LithiumConfig {
    dev: boolean;

    qqUid: string;
    qqPass: string; // qyl27: MD5 field.

    tgToken: string;

    proxy: string;  // qyl27: HTTP Proxy for tg connection, localhost and no auth is preferred.

    forwardsQQ2TG: Map<string, string>;
    forwardsTG2QQ: Map<string, string>;

    constructor() {
        dotenv.config({path: '.env'});
        dotenv.config({path: '.env.local', override: true});

        this.dev = !!process.env.LITHIUM_DEV;

        this.qqUid = process.env.LITHIUM_QQ_UID || '';
        this.qqPass = process.env.LITHIUM_QQ_PASS || '';

        this.tgToken = process.env.LITHIUM_TG_TOKEN || '';

        this.proxy = process.env.LITHIUM_TG_PROXY || '';

        this.forwardsQQ2TG = new Map();
        this.forwardsTG2QQ = new Map();

        // qyl27: For parsing string like "qqGid1:tgGid1;qqGid2:tgGid2;".
        for (const forward of (process.env.LITHIUM_FORWARDS || '').split(';')) {
            let sides = forward.split(':');
            if (sides.length == 2) {
                let qq = sides[0];
                let tg = sides[1];

                this.forwardsQQ2TG.set(qq, tg);
                this.forwardsTG2QQ.set(tg, qq);
            }
        }
    }
}

const Config = new LithiumConfig();

export { Config };
