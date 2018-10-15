export class EditorPosition {

    public getPositionChars: Function;
    public getAcePositionFromChars: Function;
    public getCurrentCharPosition: Function;
    public getCurrentLeftChar: Function;
    public getPositionChar: Function;
    public getPositionLeftChar: Function;

    constructor(public editor: AceAjax.Editor) {

        this.getPositionChars = (pos: AceAjax.Position) => {
            var doc = editor.getSession().getDocument();
            return this.getChars(doc, pos);
        };

        this.getAcePositionFromChars = (chars: number) => {
            var doc = editor.getSession().getDocument();
            return this.getPosition(doc, chars);
        };

        this.getCurrentCharPosition = () => {
            return this.getPositionChars(editor.getCursorPosition());
        };

        this.getCurrentLeftChar = () => {
            return this.getPositionLeftChar(editor.getCursorPosition());
        };

        this.getPositionChar = (cursor: AceAjax.Position) => {
            var range = <AceAjax.Range>{
                start: {
                    row: cursor.row,
                    column: cursor.column
                },
                end: {
                    row: cursor.row,
                    column: cursor.column + 1
                }
            };
            return editor.getSession().getDocument().getTextRange(range);
        };

        this.getPositionLeftChar = (cursor: AceAjax.Position) => {
            var range = <AceAjax.Range>{
                start: {
                    row: cursor.row,
                    column: cursor.column
                },
                end: {
                    row: cursor.row,
                    column: cursor.column - 1
                }
            };
            return editor.getSession().getDocument().getTextRange(range);
        };

    }

    getLinesChars(lines: string[]) {
        var count: number;
        count = 0;
        lines.forEach((line) => {
            return count += line.length + 1;
        });
        return count;
    }

    getChars(doc: AceAjax.Document, pos: AceAjax.Position) {
        return this.getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
    }

    getPosition(doc: AceAjax.Document, chars: number) {
        var count: number, n: string, line: string, lines: string[], row: number;
        lines = doc.getAllLines();
        count = 0;
        row = 0;
        for (n in lines) {
            line = lines[n];
            if (chars < (count + (line.length + 1))) {
                return {
                    row: row,
                    column: chars - count
                };
            }
            count += line.length + 1;
            row += 1;
        }
        return {
            row: row,
            column: chars - count
        };
    }
}