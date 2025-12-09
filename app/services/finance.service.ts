import { apiClient } from '~/lib/api-client'
import type { 
  Account, 
  Transaction, 
  Category, 
  CreateAccountDto,
  UpdateAccountDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  Currency
} from '~/types'

export const financeService = {
  // Account Services
  getUserAccounts: async (): Promise<Account[]> => {
    const response = await apiClient.get<Account[]>('/finance/accounts')
    return response.data
  },

  getUserAccount: async (accountId: string): Promise<Account> => {
    const response = await apiClient.get<Account>(`/finance/accounts/${accountId}`)
    return response.data
  },

  createUserAccount: async (data: CreateAccountDto): Promise<Account> => {
    const response = await apiClient.post<Account>('/finance/accounts', data)
    return response.data
  },

  updateUserAccount: async (accountId: string, data: UpdateAccountDto): Promise<{ account: Account }> => {
    const response = await apiClient.put<{ account: Account }>(`/finance/accounts/${accountId}`, data)
    return response.data
  },

  deleteUserAccount: async (accountId: string): Promise<void> => {
    await apiClient.delete(`/finance/accounts/${accountId}`)
  },

  getSupportedCurrencies: async (): Promise<{ currencies: Currency[] }> => {
    const response = await apiClient.get<{ currencies: Currency[] }>('/finance/currencies')
    return response.data
  },

  // Transaction Services
  getAccountTransactions: async (accountId: string): Promise<{ transactions: Transaction[] }> => {
    const response = await apiClient.get<{ transactions: Transaction[] }>(`/finance/accounts/${accountId}/transactions`)
    return response.data
  },

  getAccountTransaction: async (accountId: string, transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/finance/accounts/${accountId}/transactions/${transactionId}`)
    return response.data
  },

  createAccountTransaction: async (accountId: string, data: CreateTransactionDto): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(`/finance/accounts/${accountId}/transactions`, data)
    return response.data
  },

  updateAccountTransaction: async (
    accountId: string, 
    transactionId: string, 
    data: UpdateTransactionDto
  ): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(
      `/finance/accounts/${accountId}/transactions/${transactionId}`, 
      data
    )
    return response.data
  },

  deleteAccountTransaction: async (accountId: string, transactionId: string): Promise<void> => {
    await apiClient.delete(`/finance/accounts/${accountId}/transactions/${transactionId}`)
  },

  // Category Services
  getAccountCategories: async (accountId: string): Promise<{ categories: Category[] }> => {
    const response = await apiClient.get<{ categories: Category[] }>(`/finance/accounts/${accountId}/categories`)
    return response.data
  },

  getAccountCategory: async (accountId: string, categoryId: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/finance/accounts/${accountId}/categories/${categoryId}`)
    return response.data
  },

  createAccountCategory: async (accountId: string, data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<Category>(`/finance/accounts/${accountId}/categories`, data)
    return response.data
  },

  updateAccountCategory: async (
    accountId: string, 
    categoryId: string, 
    data: UpdateCategoryDto
  ): Promise<Category> => {
    const response = await apiClient.put<Category>(
      `/finance/accounts/${accountId}/categories/${categoryId}`, 
      data
    )
    return response.data
  },

  deleteAccountCategory: async (accountId: string, categoryId: string): Promise<void> => {
    await apiClient.delete(`/finance/accounts/${accountId}/categories/${categoryId}`)
  },
}