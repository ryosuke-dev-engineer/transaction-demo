import { NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST() {
  const client = await pool.connect()

  try {
    // トランザクション開始
    await client.query("BEGIN")

    // 既存のアカウントを削除
    await client.query("DELETE FROM accounts")

    // アカウントを初期状態で再作成
    await client.query("INSERT INTO accounts (id, balance) VALUES (1, 1000), (2, 1000)")

    // トランザクションをコミット
    await client.query("COMMIT")

    // リセット後の状態を取得
    const result = await client.query("SELECT id, balance FROM accounts ORDER BY id")

    return NextResponse.json({
      success: true,
      message: "アカウントの残高をリセットしました",
      accounts: result.rows,
    })
  } catch (err: any) {
    // エラーが発生した場合はロールバック
    await client.query("ROLLBACK")

    return NextResponse.json(
      {
        success: false,
        message: "リセットに失敗しました",
        error: err.message,
      },
      { status: 500 },
    )
  } finally {
    client.release()
  }
}