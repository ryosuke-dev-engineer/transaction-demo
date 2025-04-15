export interface AccountRecord {
  id: number
  balance: number
}

export interface TransferResult {
  beforeState: AccountRecord[]
  afterState: AccountRecord[]
  sqlStatements: string[]
  useTransaction: boolean
  error: string | null
}
