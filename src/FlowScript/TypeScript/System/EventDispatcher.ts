// ############################################################################################################################
namespace FlowScript {
    // A simple event dispatcher.

    export interface IEventDispatcher<TOwner extends {}> { target: TOwner; }
    export interface IEventDispatcherHandlerFunction { (this: {} | EventDispatcher<{}, IEventDispatcherHandlerFunction>, ...args: any[]): boolean | void }
    export interface IEventDispatcherHandler<TOwner extends {} | null, THandler extends IEventDispatcherHandlerFunction> { (this: TOwner | EventDispatcher<TOwner, THandler>, ...args: any[]): boolean | void };
    export interface IEventDispatcherHandlerInfo<TOwner extends {} | null, THandler extends IEventDispatcherHandler<TOwner, IEventDispatcherHandlerFunction>> { handler: THandler; removeOnTrigger: boolean; data: any; }

    /** Represents an event dispatcher manager. */
    export class EventDispatcher<TOwner extends {}=null, THandler extends IEventDispatcherHandler<TOwner, IEventDispatcherHandlerFunction>=IEventDispatcherHandler<TOwner, IEventDispatcherHandlerFunction>> implements IEventDispatcher<TOwner> {
        get target() { return this._owner; }
        private _owner: TOwner;

        protected _handlers: IEventDispatcherHandlerInfo<TOwner, THandler>[] = [];

        /** Constructs a new event dispatcher.
          * If 'synchronous' is false (default), then a 'setTimeout()' if 0 is used to trigger events.  This allows following
          * code to complete before events trigger, as objects can be created and attached before they get configured.  If
          * 'synchronous' is true, calling 'trigger()' calls all event handlers immediately.
          * @param canCancel If true (default) then event handlers can return true to cancel events.
          * @param eventCaller If specified, this function will be called to execute the handler. If 'false' is returned,
          *                    then all other handlers will not be called, and the event will end. The given 'args' array
          *                    holds the arguments to be passed onto the handler referenced in 'currentHandler'.
          *                    The 'this' context of this caller handler should also be passed onto the given handler.
          * @param onCompleted If specified, this function will be called after all events fire - except when 'canCancel' is true and any event handler returns 'false' to cancel.
          *                    A common use of this event to trigger the end of a "changing" event to trigger a "changed" event.
          */
        constructor(owner: TOwner, public readonly synchronous = false, public readonly canCancel = true,
            public eventCaller: (/** Current handler being called. */currentHandler: THandler, /** Arguments to pass to the current handler. */...args: any[]) => boolean = null,
            public onCompleted: THandler = null) {
            this._owner = owner;
            if (synchronous && typeof setTimeout != 'function')
                throw "Asynchronous events are not supported in this environment.";
        }

        /** Locate the index of a handler by function reference. */
        indexOf(func: THandler): number {
            for (var i = 0, n = this._handlers.length; i < n; ++i)
                if (this._handlers[i].handler == func)
                    return i;
            return -1;
        }

        /** Add a handler for this event dispatcher.  If the function already exists, the current entry is updated. 
         * @param removeOnTrigger If true then the event is removed as long as 'canCancel' is false, or 'false' is not returned from the handler, or a previous handler.
         */
        add(func: THandler, data?: any, removeOnTrigger?: boolean): IEventDispatcherHandlerInfo<TOwner, THandler> {
            var i = this.indexOf(func);
            if (i >= 0) {
                var handlerInfo = this._handlers[i];
                if (removeOnTrigger !== void 0)
                    handlerInfo.removeOnTrigger = removeOnTrigger;
            }
            else this._handlers.push(handlerInfo = { handler: func, removeOnTrigger: removeOnTrigger, data: data });
            return handlerInfo;
        }

        /** Remove a handler from this event dispatcher. */
        remove(func: THandler): IEventDispatcherHandlerInfo<TOwner, THandler> {
            var i = this.indexOf(func);
            if (i >= 0)
                return this._handlers.splice(i, 1)[0];
            else
                return void 0;
        }

        /** Remove all handlers from this event dispatcher. */
        clear(): void {
            this._handlers.length = 0;
        }

        /** Trigger this event by calling all the handlers. 
         * If 'synchronous' is true, and 'true' is returned, then the request succeeded.
         * When 'synchronous' is false, 'setTimeout()' is used to fire the trigger after current execution completes. In this case there is no return value (undefined).
         */
        readonly trigger: (...args: Parameters<THandler>) => boolean | void;

        /** Trigger this event by calling all the handlers. 
         * A promise is used so the caller can use 'await' and have 'completed' events triggered as well.
         */
        readonly triggerAsync: (...args: Parameters<THandler>) => Promise<void>;

        static _ctor = (() => {
            function getTriggerFunc(this: EventDispatcher, ...args: any[]) {
                args.push(void 0, this); // (add 2 optional items on end)
                var dataIndex = args.length - 2; // (set the index where the data should be set when each handler gets called)
                return function _trigger(this: EventDispatcher) {
                    for (var i = 0, n = this._handlers.length; i < n; ++i) {
                        var h = <IEventDispatcherHandlerInfo<any, any>>this._handlers[i];
                        args[dataIndex] = h.data;
                        var result = this.eventCaller ? this.eventCaller.call(this._owner || this, h.handler, args) : h.handler.apply(this._owner || this, args);
                        if (this.canCancel && result === false) return false;
                        if (h.removeOnTrigger) { this._handlers.splice(i, 1); --i; --n; }
                    }
                    return !this.onCompleted || this.onCompleted.apply(this._owner || this, args) !== false;
                }
            };
            (<Writeable<EventDispatcher>>EventDispatcher.prototype).trigger = function trigger(this: EventDispatcher, ...args: any[]): boolean | void {
                var _trigger = getTriggerFunc.apply(this, args);
                if (!this.synchronous && typeof setTimeout == 'function')
                    setTimeout(() => { _trigger.call(this); }, 0);
                else
                    return _trigger.call(this);
            };
            (<Writeable<EventDispatcher>>EventDispatcher.prototype).triggerAsync = function triggerAsync(this: EventDispatcher, ...args: any[]): Promise<void> {
                var _trigger = getTriggerFunc.apply(this, args);
                return new Promise<void>((resolve, reject) => {
                    if (!this.synchronous && typeof setTimeout == 'function')
                        setTimeout(() => { if (_trigger.call(this)) resolve(); else reject(); }, 0);
                    else
                        if (_trigger.call(this)) resolve(); else reject();
                });
            };
        })();
    }

}
// ############################################################################################################################
