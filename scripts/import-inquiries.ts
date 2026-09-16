import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(filePath: string) {
  const env: Record<string, string> = {};
  const text = readFileSync(filePath, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    env[trimmed.slice(0, separator)] = trimmed.slice(separator + 1);
  }

  return env;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current || row.length) {
    row.push(current);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }

  return rows;
}

function parseDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return new Date().toISOString();
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("사용법: npx tsx scripts/import-inquiries.ts <csv-path>");
    process.exit(1);
  }

  const env = loadEnv(resolve(process.cwd(), ".env.local"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(".env.local에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = parseCsv(readFileSync(resolve(csvPath), "utf8"));
  const bodyRows = rows.slice(1);
  const records = [];

  for (const row of bodyRows) {
    const name = (row[1] ?? "").trim();
    if (!name) continue;

    const statusRaw = (row[7] ?? "").trim();
    const status = ["접수", "확인", "완료"].includes(statusRaw) ? statusRaw : "접수";
    const privacy = (row[6] ?? "").trim().toUpperCase();

    records.push({
      submitted_at: parseDate(row[0] ?? ""),
      name,
      company: (row[2] ?? "").trim(),
      phone: (row[3] ?? "").trim(),
      email: (row[4] ?? "").trim(),
      message: (row[5] ?? "").trim(),
      privacy_agreed: privacy === "Y" || privacy === "YES" || privacy === "TRUE",
      status,
      notes: (row[8] ?? "").trim(),
    });
  }

  if (records.length === 0) {
    console.log("가져올 문의가 없습니다.");
    process.exit(0);
  }

  const { error } = await supabase.from("inquiries").insert(records);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`${records.length}건을 가져왔습니다.`);
}

void main();
