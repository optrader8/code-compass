"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.TextDocumentSyncKind = void 0;
var TextDocumentSyncKind;
(function (TextDocumentSyncKind) {
    TextDocumentSyncKind[TextDocumentSyncKind["None"] = 0] = "None";
    TextDocumentSyncKind[TextDocumentSyncKind["Full"] = 1] = "Full";
    TextDocumentSyncKind[TextDocumentSyncKind["Incremental"] = 2] = "Incremental";
})(TextDocumentSyncKind = exports.TextDocumentSyncKind || (exports.TextDocumentSyncKind = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["Error"] = "error";
    LogLevel["Warn"] = "warn";
    LogLevel["Info"] = "info";
    LogLevel["Debug"] = "debug";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
//# sourceMappingURL=config.js.map