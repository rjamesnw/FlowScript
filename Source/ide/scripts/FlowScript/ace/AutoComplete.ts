import {HashHandler} from 'ace/keyboard/hash_handler';
import {EventEmitter}  from "ace/lib/event_emitter";
import {AutoCompleteView} from './AutoCompleteView';
import {Range as AceRange} from "ace/range";

var oop = require("ace/lib/oop");
import {CompletionService} from "./CompletionService";

type INewKeyHandlerReturnType = AceAjax.EditorCommand & { command: any, args: any };

export class AutoComplete {
    listElement: any;
    inputText: string;
    _active: boolean;

    public handler: AceAjax.HashHandler; // HashHandler
    public view: any; // AutoCompleteView
    public scriptName: string;

    // From EventEmitter base class: 
    _emit: any;

    constructor(public editor: AceAjax.Editor, public script: string, public completionService: CompletionService) {
        oop.implement(this, EventEmitter);

        this.handler = new HashHandler();
        this.view = new AutoCompleteView(editor, this);
        this.scriptName = script;
        this._active = false;
        this.inputText = ''; //TODO imporve name


        this.handler.attach = () => {
            editor.addEventListener("change", this.refreshCompletions);
            this._emit("attach", { sender: this });
            this._active = true;
        };

        this.handler.detach = () => {
            editor.removeEventListener("change", this.refreshCompletions);
            this.view.hide();
            this._emit("detach", { sender: this });
            this._active = false;
        };

        var self = this;
        this.handler.handleKeyboard = function (data: any, hashId: number, key: string, keyCode: number)
            : INewKeyHandlerReturnType {
            if (hashId == -1) {

                if (" -=,[]_/()!';:<>".indexOf(key) != -1) { //TODO
                    self.deactivate();
                }
                return null;
            }

            var command = <INewKeyHandlerReturnType>self.handler.findKeyCommand(hashId, key);

            if (!command) {

                var defaultCommand = <AceAjax.EditorCommand>editor.commands.findKeyCommand(hashId, key);
                if (defaultCommand) {
                    if (defaultCommand.name == "backspace") {
                        return null;
                    }
                    self.deactivate();
                }
                return null;
            }

            if (typeof command != "string") {
                var args = command.args;
                command = command.command;
            }

            if (typeof command == "string") {
                // TODO: No idea what `this` is over here
                command = <INewKeyHandlerReturnType>(<AceAjax.HashHandler>this).commands[<string><any>command];
            }

            return <any>{ command: command, args: args };
        };


        var Keybinding = <AceAjax.IKeyBindingList>{
            "Up|Ctrl-p": "focusprev",
            "Down|Ctrl-n": "focusnext",
            "esc|Ctrl-g": "cancel",
            "Return|Tab": "insertComplete"
        };

        this.handler.bindKeys(Keybinding);

        this.handler.addCommands(<AceAjax.IKeyBindingList>{
            focusnext: (editor) => {
                self.view.focusNext();
            },
            focusprev: (editor) => {
                self.view.focusPrev();
            },
            cancel: (editor) => {
                self.deactivate();
            },
            insertComplete: (editor) => {
                editor.removeEventListener("change", self.refreshCompletions);
                var curr = self.view.current();

                for (var i = 0; i < self.inputText.length; i++) {
                    editor.remove("left");
                }

                if (curr) {
                    editor.insert($(curr).data("name"));
                }
                self.deactivate();

            }
        });
    }


    isActive = () => {
        return this._active;
    };

    setScriptName = (name: string) => {
        this.scriptName = name;
    };

    show = () => {
        this.listElement = this.view.listElement;
        this.editor.container.appendChild(this.view.wrap);
        this.listElement.innerHTML = '';
    };

    hide = () => {
        this.view.hide();
    }

    compilation = (cursor: AceAjax.Position) => {
        var compilationInfo = this.completionService.getCursorCompilation(this.scriptName, cursor);
        var text = this.completionService.matchText;
        var coords = this.editor.renderer.textToScreenCoordinates(cursor.row, cursor.column - text.length);

        this.view.setPosition(coords);
        this.inputText = text;

        //var compilations = compilationInfo.entries;
        //Shermie modified
        var compilations = compilationInfo ? compilationInfo.entries : null;

        //No longer need this, filter was done in the CompletionService
        //if (this.inputText.length > 0){
        //    compilations = compilationInfo.entries.filter((elm)=>{
        //        return elm.name.toLowerCase().indexOf(this.inputText.toLowerCase()) == 0 ;
        //    });
        //}

        var matchFunc = (elm: ts.CompletionEntry) => {
            return elm.name.indexOf(this.inputText) == 0 ? 1 : 0;
        };

        var matchCompare = (a: ts.CompletionEntry, b: ts.CompletionEntry) => {
            return matchFunc(b) - matchFunc(a);
        };

        var textCompare = (a: ts.CompletionEntry, b: ts.CompletionEntry) => {
            if (a.name == b.name) {
                return 0;
            } else {
                return (a.name > b.name) ? 1 : -1;
            }
        };

        var compare = (a: ts.CompletionEntry, b: ts.CompletionEntry) => {
            var ret = matchCompare(a, b);
            return (ret != 0) ? ret : textCompare(a, b);
        };

        //compilations = compilations.sort(compare);

        //this.showCompilation(compilations);
        //Shermie Modified
        compilations = compilations ? compilations.sort(compare) : null;

        if (compilations) {
            this.showCompilation(compilations);
        }

        //return compilations.length;
        //Shermie Modified
        return compilations ? compilations.length : 0;
    };

    refreshCompletions = (e: AceAjax.EditorChangeEvent) => {
        var cursor = this.editor.getCursorPosition();
        var data = e;
        var newText = this.editor.getSession().getTextRange(new AceRange(data.start.row, data.start.column, data.end.row, data.end.column));
        if (e.action == "insert") {
            cursor.column += 1;
        } else if (e.action == "remove") {
            if (newText == '\n') {
                this.deactivate();
                return;
            }
        }

        this.compilation(cursor);
    };

    showCompilation = (infos: ts.CompletionEntry[]) => {
        if (infos.length > 0) {
            this.view.show();
            var html = '';
            // TODO use template
            for (var i = 0, n = infos.length; i < n; ++i) {
                var info: ts.CompletionEntry & { [name: string]: any } = infos[i];
                var name = '<span class="label-name">' + info.name + '</span>';
                //Shermie Added
                var detail = '<span class="label-detail"> ' + info["detail"] + '</span>';

                var type = '<span class="label-type">' + info.kind + '</span>';
                var kind = '<span class="label-kind label-kind-' + info.kind + '">' + info.kind.charAt(0) + '</span>';

                //html += '<li data-name="' + info.name + '">' + kind + name + type + '</li>';
                //Shermie added for overload signatures
                if (info["signatures"]) {
                    for (var index = 0; index < info["signatures"].length; index++) {
                        var _sign_info = info["signatures"][index].substring(info["signatures"][index].indexOf('(') + 1, info["signatures"][index].lastIndexOf(')'));
                        var _style_display = (info["signatures"].length < 3) ? "" : "display:none";
                        var _sign_title = info["signatures"][index].replace(/"/g, '&quot;');
                        _sign_info = _sign_info.replace(/"/g, '&quot;');

                        html += '<div data-name="' + _sign_info + '" data-toogle="tooltip" data-placement="right" title="' + _sign_title + '">' + kind + info["signatures"][index] // + '</div>';
                            //append overload doc after each overload method
                            + '<div class="label-paramDoc" >' + info["paramDoc"][index] + '</div>' +
                            '<div class="label-doc" style="' + _style_display + '">' + info["signDoc"][index] + '</div>' +
                            '</div>';

                    }

                } else {
                    var title = info.name + info["detail"];
                    title = title.replace(/"/g, '&quot;');
                    html += '<div data-name="' + info.name + '" data-toogle="tooltip" data-placement="right" title="' + title + '">' + kind + name + detail +
                        '<div class="label-doc" style="display:none">' + info["doc"] + '</div></div>';
                }
            }
            this.listElement.innerHTML = html;
            this.view.ensureFocus();
        } else {
            this.view.hide();
        }
    };

    active = () => {
        this.show();
        var count = this.compilation(this.editor.getCursorPosition());
        if (!(count > 0)) {
            this.hide();
            return;
        }
        this.editor.keyBinding.addKeyboardHandler(this.handler);
    };

    deactivate = () => {
        this.editor.keyBinding.removeKeyboardHandler(this.handler);
    };

};