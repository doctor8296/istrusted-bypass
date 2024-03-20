(() => {
  const secretProperty = Symbol("listeners");
  EventTarget.prototype.addEventListener = new Proxy(
    EventTarget.prototype.addEventListener,
    {
      apply(target, thisArg, [eventName, callbackFunction, options]) {
        if (secretProperty in thisArg) {
          if (eventName in thisArg[secretProperty]) {
            thisArg[secretProperty][eventName].add(callbackFunction);
          } else {
            thisArg[secretProperty][eventName] = new Set([callbackFunction]);
          }
        } else {
          thisArg[secretProperty] = {
            [eventName]: new Set([callbackFunction]),
          };
        }
        return Reflect.apply(...arguments);
      },
    }
  );

  EventTarget.prototype.removeEventListener = new Proxy(
    EventTarget.prototype.removeEventListener,
    {
      apply(target, thisArg, [eventName, callbackFunction]) {
        if (secretProperty in thisArg) {
          if (eventName in thisArg[secretProperty]) {
            if (thisArg[secretProperty][eventName].has(callbackFunction)) {
              thisArg[secretProperty][eventName].delete(callbackFunction);
              if (thisArg[secretProperty][eventName].size === 0) {
                delete thisArg[secretProperty][eventName];
                if (Object.keys(thisArg[secretProperty]).length === 0) {
                  delete thisArg[secretProperty];
                }
              }
            }
          }
        }
        return Reflect.apply(...arguments);
      },
    }
  );

  EventTarget.prototype.dispatchEvent = new Proxy(
    EventTarget.prototype.dispatchEvent,
    {
      apply(target, thisArg, [event]) {
        if (!(secretProperty in thisArg)) {
          return Reflect.apply(...arguments);
        }
        if (event.type in thisArg[secretProperty]) {
          for (const callbackFunction of [
            ...thisArg[secretProperty][event.type],
          ]) {
            callbackFunction(
              new Proxy(event, {
                get(target, prop) {
                  if (prop === "isTrusted") {
                    return true;
                  }
                  return target[prop];
                },
              })
            );
          }
        }
      },
    }
  );
})();
