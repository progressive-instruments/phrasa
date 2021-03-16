"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = void 0;
var index_1 = require("antlr4/index");
var NotesLexer_js_1 = require("../generated-parser/NotesLexer.js");
function createLexer(input) {
    var chars = new index_1.InputStream(input);
    var lexer = new NotesLexer_js_1.NotesLexer(chars);
    lexer.strictMode = false;
    return lexer;
}
function getSequence(input) {
    let lexer = createLexer(input);
    return createLexer(input).getAllTokens();
}
exports.getTokens = getTokens;
//# sourceMappingURL=ParserFacade.js.map