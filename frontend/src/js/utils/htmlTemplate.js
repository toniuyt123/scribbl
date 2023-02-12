function escapeHtml(unsafe) {
  if (unsafe === false || unsafe === null || unsafe === undefined) {
    return "";
  }

  if (unsafe instanceof EscapedHTMLTemplate) {
    return unsafe;
  }

  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class EscapedHTMLTemplate {
  constructor(content) {
    this.content = content;
  }
  toString() {
    return this.content;
  }
}

export default function htmlTemplate(strings, ...values) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      if (Array.isArray(values[i])) {
        result += values[i].map((v) => escapeHtml(v)).join("");
      } else {
        result += escapeHtml(values[i]);
      }
    }
  }
  return new EscapedHTMLTemplate(result);
}
