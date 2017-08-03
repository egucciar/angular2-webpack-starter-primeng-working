import { Observable, Subject } from "rxjs/Rx";

const message = new Subject();

function notify(channel, data) {
    message.next({
        channel,
        data: data || {}
    });
}

function receive(channel, callback) {
    const msg = message.filter(m => m.channel === channel)
        .map(m => m.data);
    if (callback) {
        return msg.subscribe(callback);
    }
    return msg;
}

export {
    notify,
    receive
}