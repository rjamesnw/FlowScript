define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DocumentPositionUtil;
    (function (DocumentPositionUtil) {
        DocumentPositionUtil.getLinesChars = function (lines) {
            var count;
            count = 0;
            lines.forEach(function (line) {
                return count += line.length + 1;
            });
            return count;
        };
        DocumentPositionUtil.getChars = function (doc, pos) {
            return DocumentPositionUtil.getLinesChars(doc.getLines(0, pos.row - 1)) + pos.column;
        };
        DocumentPositionUtil.getPosition = function (doc, chars) {
            var count, n, line, lines, row;
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
    })(DocumentPositionUtil = exports.DocumentPositionUtil || (exports.DocumentPositionUtil = {}));
});
//# sourceMappingURL=DocumentPositionUtil.js.map