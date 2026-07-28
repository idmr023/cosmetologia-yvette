"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatForTelegram = formatForTelegram;
function formatForTelegram(text) {
    let safe = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    safe = safe.replace(/\*\*(.+?)\*\*/gs, "<b>$1</b>");
    safe = safe.replace(/```(\w*)\n?([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
    safe = safe.replace(/`(.+?)`/g, "<code>$1</code>");
    safe = safe.replace(/\u2014/g, "—").replace(/\u2013/g, "–").replace(/\u00a0/g, " ");
    safe = safe.replace(/\*\*/g, "");
    return safe;
}
//# sourceMappingURL=format.js.map