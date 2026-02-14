export function parseCsvText(text: string): string[][] {
  if (!text) return [];

  const stripped = text.replace(/^\uFEFF/, "");
  const normalized = stripped.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").filter((line, index, arr) => {
    return line.trim() !== "" || index < arr.length - 1;
  });

  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        row.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }

    row.push(currentField);
    rows.push(row);
  }

  return rows;
}
