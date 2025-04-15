import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TransferResult, AccountRecord } from "@/types/transfer"
import { Loader2 } from "lucide-react"

interface ResultDisplayProps {
  result: TransferResult | null
  isLoading: boolean
}

export function ResultDisplay({ result, isLoading }: ResultDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">処理中...</span>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center text-gray-500 h-64 flex items-center justify-center">
        <p>送金を実行すると結果がここに表示されます</p>
      </div>
    )
  }

  // SQLステートメントの表示順序を実行順に合わせる
  const orderedSqlStatements = [...result.sqlStatements]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">送金前の状態</h3>
        <AccountsTable accounts={result.beforeState} />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-2">実行内容</h3>
        {result.useTransaction && (
          <div className="bg-blue-50 p-2 rounded text-blue-700 mb-2">🌀 トランザクション開始 (BEGIN)</div>
        )}

        <div className="space-y-2">
          {orderedSqlStatements.map((sql, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto">
              {sql}
            </div>
          ))}
        </div>

        {result.error && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-700 mt-2">
            <p className="font-medium">エラー発生:</p>
            <p className="font-mono text-sm mt-1">{result.error}</p>
          </div>
        )}

        {result.useTransaction && (
          <div className={`p-2 rounded mt-2 ${result.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {result.error ? "❌ ROLLBACK" : "✅ COMMIT"}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">送金後の状態</h3>
        <AccountsTable accounts={result.afterState} />
      </div>
    </div>
  )
}

function AccountsTable({ accounts }: { accounts: AccountRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>残高</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id}>
            <TableCell>{account.id}</TableCell>
            <TableCell>{account.balance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
