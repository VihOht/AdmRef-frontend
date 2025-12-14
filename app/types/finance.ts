export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  BRL = 'BRL',
  GBP = 'GBP',
}

export enum TypesTransactionCategory {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Account {
  id: string
  name: string
  balance: number
  currency: Currency
  transactions?: Transaction[]
  createdAt?: string
  updatedAt?: string
}

export interface Transaction {
  id: string
  amount: number
  description?: string
  type: TypesTransactionCategory
  createdAt: string
  updatedAt?: string
  categoryId?: string
  category?: {
    id: string
    name: string
    description?: string
  }
}

export interface Category {
  id: string
  accountId: string
  name: string
  domain: TypesTransactionCategory
  description?: string
  createdAt: string
  updatedAt: string
  transactions?: Transaction[]
}

export interface CreateAccountDto {
  name: string
  currency: Currency
}

export interface UpdateAccountDto {
  name?: string
  currency?: Currency
}

export interface CreateTransactionDto {
  amount: number
  description?: string
  categoryId?: string
}

export interface UpdateTransactionDto {
  amount?: number
  description?: string
  categoryId?: string
}

export interface CreateCategoryDto {
  name: string
  domain: TypesTransactionCategory
  description?: string
}

export interface UpdateCategoryDto {
  name?: string
  domain?: TypesTransactionCategory
  description?: string
}