// =============================================================
// API: /api/transactions
//
//   GET  /api/transactions?month=2026-10  … その月の取引一覧を返す
//   POST /api/transactions                … 取引を新規登録する
//
// Next.js では app/api/◯◯/route.ts に GET や POST という名前の関数を
// export すると、それがそのまま API になる（このコードは Node.js 上で動く）。
// =============================================================
import { NextResponse, type NextRequest } from "next/server";
import { categoryExists, createTransaction, findTransactionsByMonth } from "@/lib/repository";
import { isValidMonth, validateTransactionInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  // URL の ?month=2026-10 の部分を取り出す
  const month = request.nextUrl.searchParams.get("month");
  if (!isValidMonth(month)) {
    return NextResponse.json({ error: "month は YYYY-MM 形式で指定してください" }, { status: 400 });
  }

  const transactions = await findTransactionsByMonth(month);
  return NextResponse.json(transactions); // 配列を JSON にして返す（ステータス 200）
}

export async function POST(request: NextRequest) {
  // ① リクエストの本文 (JSON) を読む
  const body = await request.json().catch(() => null);

  // ② 入力チェック
  const validation = validateTransactionInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  if (!(await categoryExists(validation.value.categoryId))) {
    return NextResponse.json({ error: "存在しないカテゴリです" }, { status: 400 });
  }

  // ③ DB に登録して、登録結果を返す（201 = Created）
  const created = await createTransaction(validation.value);
  return NextResponse.json(created, { status: 201 });
}
