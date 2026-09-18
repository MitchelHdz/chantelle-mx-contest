import fs from "node:fs/promises";

import { SpreadsheetFile, Workbook } from "/Users/sebastian.hernandez/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const outputDir = new URL("../outputs/01a0b1a7-0dc9-71f2-bfb8-65da311a4886/", import.meta.url);
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const participations = workbook.worksheets.add("Participaciones");
const instructions = workbook.worksheets.add("Instrucciones");

const headers = [[
  "Folio",
  "Fecha de registro",
  "Nombre",
  "Apellidos",
  "Correo",
  "Teléfono",
  "Tienda",
  "Fecha de compra",
  "Estado en sistema",
  "Consentimiento marketing",
  "Revisión",
  "Comentarios",
  "Última sincronización",
]];

participations.getRange("A1:M1").values = headers;
participations.getRange("A1:M1").format = {
  fill: "#F1F3F4",
  font: { name: "Arial", size: 10, bold: true, color: "#202124" },
  borders: { preset: "all", style: "thin", color: "#DADCE0" },
  verticalAlignment: "center",
  wrapText: true,
};
participations.getRange("A2:M1000").format.font = { name: "Arial", size: 10, color: "#202124" };
participations.getRange("A2:M1000").format.verticalAlignment = "center";
participations.getRange("B2:B1000").format.numberFormat = "dd/mm/yyyy hh:mm";
participations.getRange("H2:H1000").format.numberFormat = "dd/mm/yyyy";
participations.getRange("M2:M1000").format.numberFormat = "dd/mm/yyyy hh:mm";
participations.getRange("K2:K1000").dataValidation = {
  rule: { type: "list", values: ["Pendiente", "Válida", "Inválida", "Ganadora"] },
};
participations.getRange("K2:K1000").conditionalFormats.add("containsText", {
  text: "Ganadora",
  format: { fill: "#E6F4EA", font: { bold: true, color: "#137333" } },
});
participations.getRange("K2:K1000").conditionalFormats.add("containsText", {
  text: "Inválida",
  format: { fill: "#FCE8E6", font: { color: "#C5221F" } },
});
participations.getRange("K2:K1000").conditionalFormats.add("containsText", {
  text: "Pendiente",
  format: { fill: "#FEF7E0", font: { color: "#B06000" } },
});
participations.freezePanes.freezeRows(1);
participations.getRange("A1:M1").format.rowHeightPx = 42;

const widths = [130, 145, 120, 150, 210, 125, 175, 125, 130, 155, 110, 260, 145];
widths.forEach((width, index) => {
  participations.getRangeByIndexes(0, index, 1000, 1).format.columnWidthPx = width;
});

instructions.getRange("A1:B1").values = [["Uso de la hoja", "Detalle"]];
instructions.getRange("A2:B8").values = [
  ["Fuente oficial", "Supabase. Esta hoja es una vista operativa para revisión."],
  ["Actualización", "Cada registro nuevo intenta sincronizarse al instante; un job diario reintenta fallas pendientes."],
  ["Campos automáticos", "Columnas A:J y M. No deben modificarse manualmente porque se actualizan por folio."],
  ["Campos editables", "Columnas K y L: Revisión y Comentarios."],
  ["Privacidad", "La hoja no incluye la foto ni enlaces permanentes al ticket."],
  ["Revisión", "Usa Pendiente, Válida, Inválida o Ganadora. Agrega contexto en Comentarios."],
  ["Exportación", "Archivo > Descargar > Valores separados por comas (.csv) para una copia local."],
];
instructions.getRange("A1:B1").format = {
  fill: "#F1F3F4",
  font: { name: "Arial", size: 10, bold: true, color: "#202124" },
  borders: { preset: "all", style: "thin", color: "#DADCE0" },
};
instructions.getRange("A2:B8").format = {
  font: { name: "Arial", size: 10, color: "#202124" },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#E8EAED" },
};
instructions.getRange("A1:A8").format.columnWidthPx = 170;
instructions.getRange("B1:B8").format.columnWidthPx = 620;
instructions.getRange("A1:B8").format.autofitRows();
instructions.freezePanes.freezeRows(1);

workbook.recalculate();

const preview = await workbook.render({
  sheetName: "Participaciones",
  range: "A1:M8",
  scale: 1,
  format: "png",
});
await fs.writeFile(new URL("participaciones-preview.png", outputDir), new Uint8Array(await preview.arrayBuffer()));

const file = await SpreadsheetFile.exportXlsx(workbook);
await file.save(new URL("chantelle-participaciones.xlsx", outputDir).pathname);

const inspection = await workbook.inspect({
  kind: "sheet,region",
  sheetId: "Participaciones",
  range: "A1:M8",
  maxChars: 5000,
});
console.log(inspection.ndjson);
