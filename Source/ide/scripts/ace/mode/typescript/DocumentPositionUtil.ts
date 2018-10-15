export namespace DocumentPositionUtil {

    export var getLinesChars = function (lines: string[]) {
        var count: number;
        count = 0;
        lines.forEach(function (line) {
            return count += line.length + 1;
        });
        return count;
    };

    export var getChars = function (doc: AceAjax.Document, pos: AceAjax.Position) {
        return getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
    };

    export var getPosition = function (doc: AceAjax.Document, chars: number) {
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
    };
}
