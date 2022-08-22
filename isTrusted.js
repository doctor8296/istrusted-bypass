const s = Symbol('listeners');

Node.prototype.addEventListener = new Proxy(Node.prototype.addEventListener, {
    apply(target, thisArg, args) {
        thisArg[s] = thisArg[s] || {};

        if (args[0] in thisArg[s]) {
            thisArg[s][args[0]].push(args[1]);
        } else {
            thisArg[s][args[0]] = [args[1]];
        }

        return Reflect.apply(...arguments);
    }
});

Node.prototype.dispatchEvent = new Proxy(Node.prototype.dispatchEvent, {
    apply(target, thisArg, args) {
        const listeners = thisArg[s][args[0].type];
        if (listeners) {
            for (const listener of listeners) {
                listener(eventToObject(args[0]));
            }
        }
    }
});

function eventToObject(event) {
    const object = {};
    for (const property in event) object[property] = event[property];
    object.isTrusted = true;
    return object;
}
