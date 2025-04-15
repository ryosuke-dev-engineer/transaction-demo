"use client"

import { useState } from "react"
import { TransferForm } from "@/components/transfer-form"
import { ResultDisplay } from "@/components/result-display"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { TransferResult } from "@/types/transfer"

export default function Home() {
  const [result, setResult] = useState<TransferResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleTransfer = async (fromId: number, toId: number, amount: number, useTransaction: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromId,
          toId,
          amount,
          useTransaction,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Transfer failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const response = await fetch("/api/reset", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        // リセット成功時、結果表示をクリアまたは更新
        setResult(null)
      }
    } catch (error) {
      console.error("Reset failed:", error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">トランザクション体験アプリ</h1>
        <Button variant="outline" onClick={handleReset} disabled={isResetting} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isResetting ? "animate-spin" : ""}`} />
          状態をリセット
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">送金フォーム</h2>
          <TransferForm onSubmit={handleTransfer} isLoading={isLoading} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">実行結果</h2>
          <ResultDisplay result={result} isLoading={isLoading} />
        </div>
      </div>
    </main>
  )
}
