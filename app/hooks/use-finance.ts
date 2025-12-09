import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeService } from '~/services/finance.service'
import type {
  CreateAccountDto,
  UpdateAccountDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '~/types'

// Query Keys
const QUERY_KEYS = {
  accounts: ['accounts'] as const,
  account: (id: string) => ['accounts', id] as const,
  transactions: (accountId: string) => ['accounts', accountId, 'transactions'] as const,
  transaction: (accountId: string, transactionId: string) => ['accounts', accountId, 'transactions', transactionId] as const,
  categories: (accountId: string) => ['accounts', accountId, 'categories'] as const,
  category: (accountId: string, categoryId: string) => ['accounts', accountId, 'categories', categoryId] as const,
  currencies: ['currencies'] as const,
}

// Account Hooks

export function useAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: financeService.getUserAccounts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useAccount(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.account(accountId),
    queryFn: () => financeService.getUserAccount(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountDto) => financeService.createUserAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
    },
  })
}

export function useUpdateAccount(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAccountDto) => financeService.updateUserAccount(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account(accountId) })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => financeService.deleteUserAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
    },
  })
}

export function useCurrencies() {
  return useQuery({
    queryKey: QUERY_KEYS.currencies,
    queryFn: financeService.getSupportedCurrencies,
    staleTime: Infinity, // Currencies rarely change
  })
}

// Transaction Hooks

export function useTransactions(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(accountId),
    queryFn: () => financeService.getAccountTransactions(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useTransaction(accountId: string, transactionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transaction(accountId, transactionId),
    queryFn: () => financeService.getAccountTransaction(accountId, transactionId),
    enabled: !!accountId && !!transactionId,
  })
}

export function useCreateTransaction(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => financeService.createAccountTransaction(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
    },
  })
}

export function useUpdateTransaction(accountId: string, transactionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTransactionDto) => 
      financeService.updateAccountTransaction(accountId, transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transaction(accountId, transactionId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
    },
  })
}

export function useDeleteTransaction(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionId: string) => 
      financeService.deleteAccountTransaction(accountId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts })
    },
  })
}

// Category Hooks

export function useCategories(accountId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.categories(accountId),
    queryFn: () => financeService.getAccountCategories(accountId),
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCategory(accountId: string, categoryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.category(accountId, categoryId),
    queryFn: () => financeService.getAccountCategory(accountId, categoryId),
    enabled: !!accountId && !!categoryId,
  })
}

export function useCreateCategory(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => financeService.createAccountCategory(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories(accountId) })
    },
  })
}

export function useUpdateCategory(accountId: string, categoryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCategoryDto) => 
      financeService.updateAccountCategory(accountId, categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.category(accountId, categoryId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(accountId) })
    },
  })
}

export function useDeleteCategory(accountId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: string) => 
      financeService.deleteAccountCategory(accountId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories(accountId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(accountId) })
    },
  })
}