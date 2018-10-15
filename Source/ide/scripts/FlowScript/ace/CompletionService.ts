import {EditorPosition} from './EditorPosition';
import {getTSProject} from "../../ace/mode/typescript/tsProject";
var tsProject = getTSProject();

export class CompletionService {

    public editorPos: EditorPosition;
    public matchText: string;

    constructor(public editor: AceAjax.Editor) {
        this.editorPos = new EditorPosition(editor);
    }

    getCompilation(script: string, charpos: number, cursor: AceAjax.Position, isMemberCompletion: boolean, prefix: string)
        : ts.CompletionInfo {
        var compInfo = tsProject.languageService.getCompletionsAtPosition(script, charpos);
        var signatureItems: string[] = [], signatureDoc: string[] = [], paramDocs: string[] = [];

        //Grab method signatures for overload methods
        var signatureHelpItems = tsProject.languageService.getSignatureHelpItems(script, charpos);
        if (signatureHelpItems && prefix) {

            //No point to show the signatures if there is no overloads
            //if (signatureHelpItems.items.length > 1) {

            var _diff = this.editor.session.getLine(cursor.row).slice(0, cursor.column);
            var _sigIndex = 0;
            charpos = charpos - _diff.substring(_diff.indexOf('(')).length;
            compInfo = tsProject.languageService.getCompletionsAtPosition(script, charpos);
            compInfo.entries = compInfo.entries.filter(function (elm) {
                return elm.name.toLowerCase().indexOf(prefix.toLowerCase()) == 0;
            });

            signatureHelpItems.items.forEach(function (item) {
                var snippet = item.parameters.map(function (p, i) {
                    var display = ts.displayPartsToString(p.displayParts); //+ " " + ts.displayPartsToString(p.documentation);
                    if (i === signatureHelpItems.argumentIndex && _sigIndex == signatureHelpItems.selectedItemIndex) {
                        return '<span class="active">' + display + '</span>';
                    }
                    return display;
                }).join(ts.displayPartsToString(item.separatorDisplayParts));

                var label = ts.displayPartsToString(item.prefixDisplayParts)
                    + snippet
                    + ts.displayPartsToString(item.suffixDisplayParts);

                var param_doc = item.parameters.map(function (p, i) {
                    var display = p.documentation.length > 0 ? (ts.displayPartsToString(p.displayParts) + " <span>" + ts.displayPartsToString(p.documentation) + "</span>") : "";
                    if (i === signatureHelpItems.argumentIndex && _sigIndex == signatureHelpItems.selectedItemIndex) {
                        return display;
                    }
                    return "";
                });//.join('<br />');
                param_doc = param_doc.filter(function (doc) { return doc != null && doc != '' });
                //param_doc = param_doc.join('<br />');

                if (_sigIndex == signatureHelpItems.selectedItemIndex) {
                    signatureDoc.unshift(ts.displayPartsToString(item.documentation));
                    signatureItems.unshift(label);
                    paramDocs.unshift("" + param_doc);
                }
                else {
                    signatureDoc.push(ts.displayPartsToString(item.documentation));
                    signatureItems.push(label);
                    paramDocs.push("" + param_doc);
                }
                _sigIndex++;
            });
            //}
            //else {
            //    if (this.matchText.length > 0 && compInfo) {
            //        var text = this.matchText;
            //        compInfo.entries = compInfo.entries.filter(function (elm) {
            //            return elm.name.toLowerCase().indexOf(text.toLowerCase()) == 0;
            //        });

            //    }
            //}
        }

        //Shermie added: Add definition details under autocomplete
        if (compInfo && compInfo.entries.length > 0) {
            //Shermie added: Filter all the items that may match with the prefix
            if (this.matchText.length > 0 && !signatureHelpItems) {
                var text = this.matchText;
                compInfo.entries = compInfo.entries.filter(function (elm) {
                    return elm.name.toLowerCase().indexOf(text.toLowerCase()) == 0;
                });

            }

            for (var i = 0, entries = compInfo.entries, n = entries.length; i < n; i++) {
                var entrydetails = tsProject.languageService.getCompletionEntryDetails(script, charpos, compInfo.entries[i].name);
                var _entry_detials = ts.displayPartsToString(entrydetails.displayParts);
                var _entry_doc = ts.displayPartsToString(entrydetails.documentation);
                var entry: { [name: string]: any; name: string; } = entries[i];
                entry["detail"] = _entry_detials;
                entry["doc"] = _entry_doc;
                if (entry.name == prefix) {
                    entry["signatures"] = signatureItems;
                    entry["signDoc"] = signatureDoc;
                    entry["paramDoc"] = paramDocs;
                }
            }
        }

        return compInfo;
    };

    getCursorCompilation(script: string, cursor: AceAjax.Position) {
        var isMemberCompletion: boolean, matches: RegExpMatchArray, pos: number, text: string, prefix: string, prefixMatch: RegExpMatchArray;
        pos = this.editorPos.getPositionChars(cursor);
        text = this.editor.session.getLine(cursor.row).slice(0, cursor.column);

        //Shermie Added: Used for overload methods
        if (text.substring(0, text.indexOf('('))) {
            prefix = text.substring(0, text.indexOf('('));
            prefixMatch = prefix.match(/\.([a-zA-Z_0-9\$]*$)|\s([a-zA-Z_0-9\$]*$)/);
            if (prefixMatch && prefixMatch.length > 0) {
                prefix = prefixMatch[1] ? prefixMatch[1] : prefixMatch[2];
            }
            else {
                prefix = text.substring(0, text.indexOf('('));
                prefixMatch = prefix.match(/[a-zA-Z_0-9\$]*$/);
                prefix = prefixMatch[0];
            }
        }

        isMemberCompletion = false;
        matches = text.match(/\.([a-zA-Z_0-9\$]*$)/);

        if (matches && matches.length > 0) {
            this.matchText = matches[1];
            isMemberCompletion = true;
            pos -= this.matchText.length;
        } else {
            matches = text.match(/[a-zA-Z_0-9\$]*$/);
            this.matchText = matches[0];
        }
        return this.getCompilation(script, pos, cursor, isMemberCompletion, prefix);
    };

    getCurrentPositionCompilation(script: string) {
        return this.getCursorCompilation(script, this.editor.getCursorPosition());
    };
}