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
    let isInsideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (isInsideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          isInsideQuotes = !isInsideQuotes;
        }
      } else if (char === "," && !isInsideQuotes) {
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
