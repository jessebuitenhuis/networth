import type { SelectOption } from "@/lib/SelectOption.type";

import { DateFormat } from "./DateFormat";

export const DATE_FORMAT_OPTIONS: SelectOption<DateFormat>[] = [
  { value: DateFormat.YYYY_MM_DD, label: "YYYY-MM-DD" },
  { value: DateFormat.MM_DD_YYYY, label: "MM/DD/YYYY" },
  { value: DateFormat.DD_MM_YYYY, label: "DD/MM/YYYY" },
  { value: DateFormat.MM_DD_YYYY_DASH, label: "MM-DD-YYYY" },
  { value: DateFormat.DD_MM_YYYY_DASH, label: "DD-MM-YYYY" },
];
