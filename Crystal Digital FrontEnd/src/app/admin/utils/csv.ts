// One place that turns rows into a downloaded .csv file, shared by the
// Subscribers and Quote Requests exports so the two cannot drift apart.

const RISKY_PREFIX = /^[=+\-@\t\r]/;

// Every value here is quoted, so a comma, a newline or a quote inside a customer's
// name, engrave text or message cannot break the column layout. Doubling the
// quote character is the RFC 4180 way to escape it.
//
// The apostrophe prefix is CSV/formula injection defence. A cell starting with
// =, +, - or @ is executed as a formula by Excel and Sheets, so a customer could
// otherwise put "=HYPERLINK(...)" in a message and have it run on the machine of
// whoever opens the export. Prefixing with an apostrophe forces it to text.
const escapeCell = (value: string | number | null | undefined) => {
  let text = value === null || value === undefined ? "" : String(value);

  if (RISKY_PREFIX.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

export function downloadCsv(
  filename: string,
  header: string[],
  rows: (string | number | null | undefined)[][]
) {
  const csv = [header.join(","), ...rows.map((row) => row.map(escapeCell).join(","))].join("\r\n");

  // The BOM is what makes Excel read the file as UTF-8 instead of the local
  // codepage, which is what turns a Nepali or accented name into mojibake.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
