// =============================================================
// API: /api/transactions/[id]
//
//   PUT    /api/transactions/5  … id=5 の取引を更新する
//   DELETE /api/transactions/5  … id=5 の取引を削除する
//
// フォルダ名の [id] の部分が URL の「5」に対応する（動的ルート）。
// =============================================================
import { NextResponse, type NextRequest } from "next/server";
import { categoryExists, deleteTransaction, updateTransaction } from "@/lib/repository";
import { validateTransactionInput } from "@/lib/validation";

// Next.js 15 以降、params は Promise で渡されるので await して取り出す
type RouteContext = { params: Promise<{ id: string }> };

/** URL の id 文字列を数値に変換。正しくなければ null */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const id = parseId((await context.params).id);
  if (id === null) {
    return NextResponse.json({ error: "id が正しくありません" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const validation = validateTransactionInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  if (!(await categoryExists(validation.value.categoryId))) {
    return NextResponse.json({ error: "存在しないカテゴリです" }, { status: 400 });
  }

  const updated = await updateTransaction(id, validation.value);
  if (!updated) {
    return NextResponse.json({ error: "取引が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const id = parseId((await context.params).id);
  if (id === null) {
    return NextResponse.json({ error: "id が正しくありません" }, { status: 400 });
  }

  const deleted = await deleteTransaction(id);
  if (!deleted) {
    return NextResponse.json({ error: "取引が見つかりません" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 }); // 204 = 成功したが返す中身は無い
}
