// ############################################################################################################################

module FlowScript {
    // ========================================================================================================================

    /** A text message, which can later have translations applied.
      * Messages can have token place holders, such as '$0 $1 $2 ...' (where '$0' is the first argument given - see 'getMessage()').
      * When ready to translate an application's messages, you use the IDE to export a comma separated list of messages and their
      * checksum values for later match up.  If in a very rare case there is a checksum collision, you just give the message a
      * fixed internal ID.  Although some may wish to do this anyhow for clarity, using checksums allows focus on development
      * of message feedback, without the annoyance of update string tables. If a message will be used in multiple places, it's
      * a good idea to give a fixed ID.
      */
    export class Message {
        // --------------------------------------------------------------------------------------------------------------------
        private _parent: IFlowScript;

        /** By default, the ID of a message is it's checksum.  If there are conflicts (very rare), then a unique ID value must be explicitly defined. */
        get id(): string { return this._id || this._checksum.toString(); }
        private _id: string;

        /** A simple hash to identify the message. If conflicts occur (very rare), then a unique ID value must be explicitly defined. */
        get checksum(): number { return this._checksum; }
        private _checksum: number = 0;

        /** The message pattern is a text message that may contain token place holders for formatting (i.e. "Warning: $1"). */
        get messagePattern(): string { return this._messagePattern; }
        set messagePattern(value: string) {
            if (typeof value !== 'string') value = '' + value;
            if (!value) throw "Error: Message cannot be empty.";
            this._messagePattern = value;
            this._checksum = getChecksum(this._messagePattern);
        }
        private _messagePattern: string;

        get translationPattern(): string { return this._translationPattern; }
        private _translationPattern: string;

        constructor(parent: IFlowScript, message: string, id?: string) {
            if (typeof id !== void 0 && typeof id !== null)
                this._id = typeof id != 'string' ? id : '' + id;
            this.messagePattern = message;
            if (parent)
                parent.registerMessage(this);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Return a formatted message, replacing any tokens ($#) with the supplied argument values. */
        getMessage(...args: string[]): string {
            var pattern = this._translationPattern || this._messagePattern;
            var msgParts = pattern.split(/(\$\$|\$[0-9]+)/g);
            var tokens = pattern.match(/(\$\$|\$[0-9]+)/g);
            // (at this point the pattern is broken into msgParts[0]+tokens[0]+msgParts[1]+tokens[1]+...)
            var msg = msgParts.length ? msgParts[0] : "";
            for (var i = 0, n = tokens.length; i < n; ++i)
                if (tokens[i] == "$$") // (double symbols escape to a single symbol to allow a single symbol tokenized place holder)
                    msg += "$";
                else
                    msg += args[(<any>tokens[i].substring(1) | 0)] + msgParts[i + 1];
            return msg;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /** Sets a translated message pattern. This is a language translation which represents the underlying message text
          * pattern. It will act as an override when 'getMessage(...)' is called, and is reset by calling 'clearTranslation()'. */
        setTranslation(translationPattern: string): void {
            this._translationPattern = translationPattern;
        }

        /** Clears the current translated message pattern. */
        clearTranslation(): void {
            this._translationPattern = undefined;
        }

        // --------------------------------------------------------------------------------------------------------------------

        toString() { return this.messagePattern; }
        valueOf() { return this.messagePattern; }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ========================================================================================================================
}

// ############################################################################################################################
