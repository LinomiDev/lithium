/*
 This class defines the message of the bot will send.
 Please remove the ".example" to use it.
 */

export function Whoami(chatId: string, senderId: string, botId: string): string {
    return `ChatId: ${chatId}
SenderId: ${senderId}
BotId: ${botId}`;
}
