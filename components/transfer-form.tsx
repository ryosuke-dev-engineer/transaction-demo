"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TransferFormProps {
  onSubmit: (fromId: number, toId: number, amount: number, useTransaction: boolean) => void
  isLoading: boolean
}

export function TransferForm({ onSubmit, isLoading }: TransferFormProps) {
  const [fromId, setFromId] = useState<number>(1)
  const [toId, setToId] = useState<number>(2)
  const [amount, setAmount] = useState<number>(500)
  const [useTransaction, setUseTransaction] = useState<boolean>(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(fromId, toId, amount, useTransaction)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fromId">振込元ID</Label>
        <Input
          id="fromId"
          type="number"
          value={fromId}
          onChange={(e) => setFromId(Number.parseInt(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toId">振込先ID</Label>
        <Input
          id="toId"
          type="number"
          value={toId}
          onChange={(e) => setToId(Number.parseInt(e.target.value))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">金額</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number.parseInt(e.target.value))}
          required
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Switch id="useTransaction" checked={useTransaction} onCheckedChange={setUseTransaction} />
        <Label htmlFor="useTransaction" className="cursor-pointer">
          {useTransaction ? "トランザクションあり" : "トランザクションなし"}
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "送金処理中..." : "送金を実行"}
      </Button>
    </form>
  )
}
