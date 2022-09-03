import {EventArgs, MessageEventArgs} from "./eventArgs";

type Events = {
    'message': MessageEventArgs
}

type EventName = keyof Events;

type Payload<TName extends EventName> = Events[TName];

type EventHandler<T extends EventArgs> = (args: T) => void;

class EventBus<TEvents extends Record<string, EventArgs>> {
    private handlers: Map<string, Set<EventHandler<Payload<any>>>> = new Map();

    public register<TEventType extends EventName>(name: TEventType, handler: EventHandler<Payload<TEventType>>) {
        let set: Set<EventHandler<Payload<TEventType>>> | undefined = this.handlers.get(name as string);

        if (!set) {
            set = new Set();
            this.handlers.set(name as string, set);
        }

        set.add(handler);
    }

    // Todo: qyl27: Will be add cancellable feature.
    public fire<TEventType extends EventName>(name: TEventType, args: Payload<TEventType>): void {
        let set: Set<EventHandler<EventArgs>> | undefined = this.handlers.get(name as string);

        if (!set) {
            return;
        }

        let copied = [...set];
        copied.forEach(f => f(args));
    }

    public unregister<TEventType extends EventName>(name: TEventType): void;
    public unregister<TEventType extends EventName>(name: TEventType, handler: EventHandler<Payload<TEventType>>): void;
    public unregister<TEventType extends EventName>(name?: TEventType, handler?: EventHandler<Payload<TEventType>>): void {
        if (!name) {
            this.handlers.clear();
        }

        if (!handler) {
            this.handlers.delete(name as string);
        }

        let handlers: Set<EventHandler<Payload<TEventType>>> | undefined = this.handlers.get(name as string);

        if (!handlers) {
            return;
        }

        handlers.delete(handler!);  // qyl27: We believe it is not undefined.
    }
}

const eventBus = new EventBus<Events>();

export { eventBus };
