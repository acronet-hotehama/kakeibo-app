// =============================================================
// API: GET /api/summary?month=2026-10
// その月の収入・支出・残高とカテゴリ別の合計を返す
// =============================================================
import { NextResponse, type NextRequest } from "next/server";
import { getMonthlySummary } from "@/lib/repository";
import { isValidMonth } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: "month は YYYY-MM 形式で指定してください" }, { status: 400 });
  }

  const summary = await getMonthlySummary(month);
  return NextResponse.json(summary);
}
