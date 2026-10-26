// =============================================================
// 学習ポータル（HTML）を生成するスクリプト（素の JavaScript + Node.js）
//
// 実行方法: npm run portal
//
// やっていること:
//   1. 学習/ フォルダの Markdown（学習計画・確認テスト・解答）を読み込む
//   2. 表や番号付きリストを解析して、JavaScript のデータ（オブジェクト）に変換する
//   3. scripts/portal-template.html にデータを埋め込み、学習/学習ポータル.html に書き出す
//
// Markdown を書き換えたら、もう一度このスクリプトを実行すればポータルにも反映される。
// =============================================================

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STEPS } from "./walkthrough-data.mjs";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const learnDir = path.join(rootDir, "学習");

/** HTML として特別な意味を持つ文字を無害な形に置き換える */
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Markdown の行内記法（`code` / **太字** / [リンク](URL)）だけを HTML に変換する */
function inline(md) {
  let html = escapeHtml(md.trim());
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // 学習/ 内の .md へのリンクは、ポータル上では意味がないので文字だけ残す
  html = html.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return html;
}

/** "| a | b | c |" の1行を ["a", "b", "c"] に分割する */
function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split(" | ").map((c) => c.trim());
}

/** 見出し（startPattern）から次の同レベル見出しまでの行を取り出す */
function section(lines, startPattern, endPattern) {
  const start = lines.findIndex((l) => startPattern.test(l));
  if (start === -1) throw new Error(`見出しが見つかりません: ${startPattern}`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => endPattern.test(l));
  return end === -1 ? rest : rest.slice(0, end);
}

/** 「M1＋M2（20問…）」のような文字列から、受けるテストの id 一覧を取り出す */
function testIds(text) {
  const ids = [...text.matchAll(/M(\d)/g)].map((m) => `M${m[1]}`);
  if (text.includes("総合テストⅠ")) ids.push("S1");
  if (text.includes("総合テストⅡ")) ids.push("S2");
  return ids;
}

// ---------------- 学習計画 ----------------
async function parsePlan() {
  const lines = (await readFile(path.join(learnDir, "00_学習計画.md"), "utf8")).split(/\r?\n/);

  const dayRow = (line) => {
    const [id, date, unit, todo, deliv, test] = splitRow(line);
    return { id, date, unit: inline(unit), todo: inline(todo), deliv: inline(deliv), test: inline(test), tests: testIds(test) };
  };
  const days = {
    A: lines.filter((l) => /^\| A\d\d \|/.test(l)).map(dayRow),
    B: lines.filter((l) => /^\| B\d\d \|/.test(l)).map(dayRow),
  };

  const modules = lines
    .filter((l) => /^\| M\d \|/.test(l))
    .map((l) => {
      const [id, title, files, materials] = splitRow(l);
      return { id, title, files: inline(files), materials: inline(materials) };
    });

  const numbered = (heading) =>
    section(lines, heading, /^#{2,3} /)
      .filter((l) => /^\d+\. /.test(l))
      .map((l) => inline(l.replace(/^\d+\. /, "")));

  return {
    days,
    modules,
    flowChecklist: numbered(/^### フローチャートの採点チェックリスト/),
    kaishuConditions: numbered(/^### 改修課題の合格条件/),
  };
}

// ---------------- 確認テストと解答 ----------------
const TEST_HEADINGS = [
  { id: "M1", pattern: /^## M1：/ },
  { id: "M2", pattern: /^## M2：/ },
  { id: "M3", pattern: /^## M3：/ },
  { id: "M4", pattern: /^## M4：/ },
  { id: "M5", pattern: /^## M5：/ },
  { id: "M6", pattern: /^## M6：/ },
  { id: "M7", pattern: /^## M7：/ },
  { id: "S1", pattern: /^## 総合テストⅠ/ },
  { id: "S2", pattern: /^## 総合テストⅡ/ },
];

async function parseTests() {
  const qLines = (await readFile(path.join(learnDir, "01_確認テスト.md"), "utf8")).split(/\r?\n/);
  const aLines = (await readFile(path.join(learnDir, "02_解答.md"), "utf8")).split(/\r?\n/);

  const tests = {};
  for (const { id, pattern } of TEST_HEADINGS) {
    const titleLine = qLines.find((l) => pattern.test(l));
    const title = titleLine.replace(/^## /, "").replace(/（\d+問）$/, "");

    const questions = section(qLines, pattern, /^## /)
      .filter((l) => /^\d+\. /.test(l))
      .map((l) => {
        const text = l.replace(/^\d+\. /, "");
        const hands = text.includes("【実行して確かめる】");
        return { q: inline(text.replace("【実行して確かめる】", "")), hands };
      });

    // 解答の表: | # | 解答 | 採点基準 | 該当コード |（総合テストは3列）
    const answers = section(aLines, pattern, /^## /)
      .filter((l) => /^\| \d+ \|/.test(l))
      .map((l) => {
        const [, a, c, ref] = splitRow(l);
        return { a: inline(a), c: inline(c), ref: ref ? inline(ref) : "" };
      });

    if (questions.length !== answers.length) {
      throw new Error(`${id}: 問題数 (${questions.length}) と解答数 (${answers.length}) が一致しません`);
    }
    tests[id] = { title, questions, answers };
  }
  return tests;
}

// ---------------- 家計簿アプリのソースコード ----------------
// zone: どこで動くか（browser=ブラウザ / server=Node.js サーバー / db=PostgreSQL / both=両方 / config=設定）
// ※ パスワードが入る .env.local は載せない
const CODE_FILES = [
  ["画面（React コンポーネント）", "src/components/Dashboard.tsx", "browser", "画面全体の状態（表示中の月・取引一覧・集計・編集中の取引）を持ち、月が変わるたびに API からデータを取り直す"],
  ["画面（React コンポーネント）", "src/components/MonthSelector.tsx", "browser", "◀ ▶ と月の入力欄。選んだ月を親（Dashboard）に知らせる"],
  ["画面（React コンポーネント）", "src/components/SummaryCards.tsx", "browser", "収入・支出・収支の3つのカード"],
  ["画面（React コンポーネント）", "src/components/TransactionForm.tsx", "browser", "取引の入力フォーム（新規登録と編集を兼用）。入力をチェックして親の onSubmit を呼ぶ"],
  ["画面（React コンポーネント）", "src/components/TransactionList.tsx", "browser", "取引の一覧と、編集・削除ボタン"],
  ["画面（React コンポーネント）", "src/components/CategoryChart.tsx", "browser", "カテゴリ別の支出を、CSS の幅で描く棒グラフ"],
  ["ブラウザ用の関数", "src/lib/api-client.ts", "browser", "fetch で API を呼ぶ関数（一覧・集計・登録・更新・削除）"],
  ["ブラウザ用の関数", "src/lib/format.ts", "both", "金額・日付・月の表示用の関数。ブラウザでもサーバーでも使える"],
  ["見た目（CSS）", "src/app/globals.css", "browser", "アプリ全体に効く CSS。色の変数（:root）と共通クラス"],
  ["見た目（CSS）", "src/components/Dashboard.module.css", "browser", "画面全体の2列レイアウト"],
  ["見た目（CSS）", "src/components/MonthSelector.module.css", "browser", "月の切り替え部分"],
  ["見た目（CSS）", "src/components/SummaryCards.module.css", "browser", "収入・支出・収支のカード"],
  ["見た目（CSS）", "src/components/TransactionForm.module.css", "browser", "入力フォーム"],
  ["見た目（CSS）", "src/components/TransactionList.module.css", "browser", "取引一覧"],
  ["見た目（CSS）", "src/components/CategoryChart.module.css", "browser", "支出の棒グラフ"],
  ["ページ（Next.js）", "src/app/layout.tsx", "server", "全ページ共通の外枠（<html> と <body>）"],
  ["ページ（Next.js）", "src/app/page.tsx", "server", "トップページ。サーバーでカテゴリを DB から取得して Dashboard に渡す"],
  ["ページ（Next.js）", "src/app/error.tsx", "browser", "表示中にエラーが起きたときの画面（DB に接続できないときなど）"],
  ["API（Node.js で動く）", "src/app/api/transactions/route.ts", "server", "GET：月の取引一覧 ／ POST：取引の登録"],
  ["API（Node.js で動く）", "src/app/api/transactions/[id]/route.ts", "server", "PUT：取引の更新 ／ DELETE：取引の削除"],
  ["API（Node.js で動く）", "src/app/api/summary/route.ts", "server", "GET：月の収入・支出・カテゴリ別の集計"],
  ["共通の処理", "src/lib/types.ts", "both", "アプリで扱うデータの形（型）の定義。ブラウザ・サーバー共通"],
  ["共通の処理", "src/lib/validation.ts", "server", "入力チェック。API が受け取ったデータを検証する"],
  ["共通の処理", "src/lib/repository.ts", "server", "SQL を実行する関数をまとめたもの"],
  ["共通の処理", "src/lib/db.ts", "server", "PostgreSQL への接続（Pool）"],
  ["データベース（SQL）", "db/schema.sql", "db", "テーブルの定義（categories と transactions）"],
  ["データベース（SQL）", "db/seed.sql", "db", "サンプルデータ"],
  ["スクリプト（Node.js）", "scripts/db-setup.mjs", "server", "DB を作り、schema.sql と seed.sql を実行する（npm run db:setup）"],
  ["スクリプト（Node.js）", "scripts/build-portal.mjs", "server", "この学習帳を Markdown とソースから作る（npm run portal）"],
  ["設定", "package.json", "config", "npm run のコマンド一覧と、使っているライブラリ"],
  ["設定", "tsconfig.json", "config", "TypeScript の設定（@/ が src/ を指す設定もここ）"],
  ["設定", "next.config.ts", "config", "Next.js の設定"],
  ["設定", ".env.example", "config", "DB の接続先の書き方の見本（.env.local にコピーして使う）"],
];

const LANG = { ".tsx": "typescript", ".ts": "typescript", ".mjs": "javascript", ".js": "javascript", ".css": "css", ".sql": "sql", ".json": "json", ".example": "bash" };

/** import 文から、プロジェクト内のどのファイルを使っているかを調べる */
function resolveImports(file, code, allPaths) {
  const found = new Set();
  for (const m of code.matchAll(/from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g)) {
    const spec = m[1] || m[2];
    let base;
    if (spec.startsWith("@/")) base = "src/" + spec.slice(2);
    else if (spec.startsWith("./") || spec.startsWith("../")) base = path.posix.join(path.posix.dirname(file), spec);
    else continue;
    const hit = allPaths.find((p) => p === base || p.replace(/\.(tsx?|mjs|css)$/, "") === base);
    if (hit) found.add(hit);
  }
  return [...found];
}

async function readCode() {
  const allPaths = CODE_FILES.map((f) => f[1]);
  const files = [];
  for (const [group, file, zone, role] of CODE_FILES) {
    const code = (await readFile(path.join(rootDir, file), "utf8")).replace(/\r\n/g, "\n");
    files.push({ group, path: file, zone, role, lang: LANG[path.extname(file)] || "plaintext", code, uses: resolveImports(file, code, allPaths) });
  }
  // 逆引き：どのファイルから使われているか
  for (const f of files) f.usedBy = files.filter((g) => g.uses.includes(f.path)).map((g) => g.path);
  return files;
}

// ---------------- 解説をコードの行に結び付ける ----------------
// walkthrough-data.mjs の各ブロックの目印（at）をファイルの中から探し、
// 「何行目から何行目までの解説か」を決める。ファイルの全行がどれかのブロックに入る。
function buildWalkthrough(codeFiles) {
  const byPath = Object.fromEntries(codeFiles.map((f) => [f.path, f]));
  const covered = new Set();
  const steps = STEPS.map((step) => ({
    title: step.title,
    goal: inline(step.goal),
    commands: step.commands,
    check: inline(step.check),
    files: step.files.map((file) => {
      const src = byPath[file.path];
      if (!src) throw new Error(`解説にあるファイルが CODE_FILES にありません: ${file.path}`);
      covered.add(file.path);
      const lines = src.code.replace(/\n$/, "").split("\n");
      const starts = [];
      let cursor = 0;
      file.blocks.forEach((b, i) => {
        if (!b.at) {
          if (i !== 0) throw new Error(`${file.path}: 2つ目以降のブロックには at（目印）が必要です`);
          starts.push(0);
          return;
        }
        const idx = lines.findIndex((l, n) => n >= cursor && l.includes(b.at));
        if (idx === -1) throw new Error(`${file.path}: 目印「${b.at}」が見つかりません（コードを変えたら解説も直してください）`);
        const start = idx - (b.back || 0);
        if (i === 0 && start !== 0) throw new Error(`${file.path}: 最初のブロックは1行目から始めてください`);
        if (start < (starts.at(-1) ?? -1) + 1) throw new Error(`${file.path}: 「${b.at}」のブロックが前のブロックと重なっています`);
        starts.push(start);
        cursor = idx + 1;
      });
      const blocks = file.blocks.map((b, i) => ({
        start: starts[i] + 1,
        end: i + 1 < starts.length ? starts[i + 1] : lines.length,
        title: inline(b.title),
        text: b.text ? inline(b.text) : "",
      }));
      return { path: file.path, intro: inline(file.intro), blocks };
    }),
  }));
  const missing = codeFiles.filter((f) => !covered.has(f.path)).map((f) => f.path);
  if (missing.length) console.warn("解説のないファイル:", missing.join(", "));
  return steps;
}

async function main() {
  const code = await readCode();
  const data = { ...(await parsePlan()), tests: await parseTests(), code, steps: buildWalkthrough(code), builtAt: new Date().toISOString() };

  const template = await readFile(path.join(rootDir, "scripts", "portal-template.html"), "utf8");
  // JSON をそのまま <script> に入れるので、"</script>" で途切れないよう "<" をエスケープする
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  // 関数で渡すのは、コード中の "$&" などが置換用の特殊記号として解釈されないようにするため
  const html = template.replace("__PORTAL_DATA__", () => json);

  const outPath = path.join(learnDir, "学習ポータル.html");
  await writeFile(outPath, html, "utf8");

  const count = Object.values(data.tests).reduce((sum, t) => sum + t.questions.length, 0);
  console.log(`学習ポータルを生成しました: 学習/学習ポータル.html（日程 A${data.days.A.length}日・B${data.days.B.length}日、テスト${count}問、コード${data.code.length}ファイル）`);
}

main().catch((error) => {
  console.error("生成に失敗しました:", error.message);
  process.exit(1);
});
