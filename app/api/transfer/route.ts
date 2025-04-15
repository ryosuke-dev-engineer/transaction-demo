import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"
import type { TransferResult } from "@/types/transfer"

// PostgreSQLへの接続設定
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "tx_demo",
  port: 5432,
})

export async function POST(request: NextRequest) {
  const { fromId, toId, amount, useTransaction } = await request.json()

  // 数値型の検証（フロントエンドでも行っているが念のため）
  if (typeof fromId !== "number" || typeof toId !== "number" || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid input parameters" }, { status: 400 })
  }

  const client = await pool.connect()
  const result: TransferResult = {
    beforeState: [],
    afterState: [],
    sqlStatements: [],
    useTransaction: useTransaction,
    error: null,
  }

  try {
    // 送金前の状態を取得
    const beforeQuery = "SELECT id, balance FROM accounts ORDER BY id"
    const beforeRes = await client.query(beforeQuery)
    result.beforeState = beforeRes.rows

    // 送金元と送金先のアカウントが存在するか確認
    const checkFromAccount = await client.query("SELECT id FROM accounts WHERE id = $1", [fromId])
    const checkToAccount = await client.query("SELECT id FROM accounts WHERE id = $1", [toId])

    const fromAccountExists = checkFromAccount.rowCount > 0
    const toAccountExists = checkToAccount.rowCount > 0

    // トランザクション開始（useTransactionがtrueの場合）
    if (useTransaction) {
      await client.query("BEGIN")
    }

    try {
      if (useTransaction) {
        // トランザクションありの場合: 引き落とし → 入金

        // 送金元から金額を引く
        const withdrawSql = `UPDATE accounts SET balance = balance - $1 WHERE id = $2`
        result.sqlStatements.push(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`)
        const withdrawResult = await client.query(withdrawSql, [amount, fromId])

        // 更新された行数をチェック
        if (withdrawResult.rowCount === 0) {
          throw new Error(`アカウントID ${fromId} が見つかりません`)
        }

        // 送金先に金額を加える
        const depositSql = `UPDATE accounts SET balance = balance + $1 WHERE id = $2`
        result.sqlStatements.push(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`)
        const depositResult = await client.query(depositSql, [amount, toId])

        // 更新された行数をチェック
        if (depositResult.rowCount === 0) {
          throw new Error(`アカウントID ${toId} が見つかりません`)
        }

        // トランザクションをコミット
        await client.query("COMMIT")
      } else {
        // トランザクションなしの場合

        // シナリオに応じて処理順序を決定
        if (!fromAccountExists) {
          // 送金元が存在しない場合、まず送金元の確認でエラーにする
          result.sqlStatements.push(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`)
          throw new Error(`アカウントID ${fromId} が見つかりません`)
        } else if (!toAccountExists) {
          // 送金先が存在しない場合、まず送金元から引き落とし、次に送金先でエラーにする
          const withdrawSql = `UPDATE accounts SET balance = balance - $1 WHERE id = $2`
          result.sqlStatements.push(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`)
          await client.query(withdrawSql, [amount, fromId])

          // 送金先に金額を加える（ここでエラーになる）
          result.sqlStatements.push(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`)
          throw new Error(`アカウントID ${toId} が見つかりません`)
        } else {
          // 両方のアカウントが存在する場合、残高不足のシナリオを考慮
          // 残高不足の場合は、まず送金先に入金してから送金元で残高不足エラーを発生させる
          const fromAccount = await client.query("SELECT balance FROM accounts WHERE id = $1", [fromId])
          const currentBalance = fromAccount.rows[0].balance

          if (currentBalance < amount) {
            // 残高不足の場合、まず送金先に入金
            const depositSql = `UPDATE accounts SET balance = balance + $1 WHERE id = $2`
            result.sqlStatements.push(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`)
            await client.query(depositSql, [amount, toId])

            // 次に送金元から引き落とし（ここで残高不足エラーが発生）
            const withdrawSql = `UPDATE accounts SET balance = balance - $1 WHERE id = $2`
            result.sqlStatements.push(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`)
            await client.query(withdrawSql, [amount, fromId])
          } else {
            // 残高が十分ある場合は通常の順序で実行
            const withdrawSql = `UPDATE accounts SET balance = balance - $1 WHERE id = $2`
            result.sqlStatements.push(`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${fromId}`)
            await client.query(withdrawSql, [amount, fromId])

            const depositSql = `UPDATE accounts SET balance = balance + $1 WHERE id = $2`
            result.sqlStatements.push(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toId}`)
            await client.query(depositSql, [amount, toId])
          }
        }
      }
    } catch (err: any) {
      // エラーが発生した場合
      result.error = err.message

      // トランザクションをロールバック（useTransactionがtrueの場合）
      if (useTransaction) {
        await client.query("ROLLBACK")
      }
      // トランザクションなしの場合はエラーを記録するだけで、ロールバックは行わない
    }

    // 送金後の状態を取得（エラーの有無にかかわらず現在の状態を取得）
    const afterQuery = "SELECT id, balance FROM accounts ORDER BY id"
    const afterRes = await client.query(afterQuery)
    result.afterState = afterRes.rows
  } catch (err: any) {
    // クエリ実行以外のエラー（接続エラーなど）
    result.error = `システムエラー: ${err.message}`

    if (useTransaction) {
      try {
        await client.query("ROLLBACK")
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr)
      }
    }
  } finally {
    client.release()
  }

  return NextResponse.json(result)
}
