import { useState, useEffect, useMemo } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Edit, Trash2, ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Search, Filter } from 'lucide-react'
import { AlertDialog, 
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction } from '~/components/ui/alert-dialog'

import { DropdownMenu, DropdownMenuCheckboxItem } from '~/components/ui/dropdown-menu'
import { useTransactions, useDeleteTransaction, useCategories, useAccount } from '~/hooks/use-finance'
import type { TypesTransactionCategory } from '~/types'
import { formatCurrency } from '~/lib/utils'
import { EditTransactionDialog } from './EditTransactionDialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'

interface TransactionTableTabProps {
  accountId: string
}


export function TransactionTableTab({ accountId }: TransactionTableTabProps) {

  const { data: transactionsData, isLoading } = useTransactions(accountId || '')
  const { data: categoriesData, refetch: refetchCategories } = useCategories(accountId || '')

  const deleteTransaction = useDeleteTransaction(accountId || '')
  const {data: account} = useAccount(accountId || '')

  // Filters visibility state
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<TypesTransactionCategory | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const transactions = transactionsData?.transactions || []
  const categories = categoriesData?.categories || []

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Type filter
      if (filterType !== 'ALL' && transaction.type !== filterType) {
        return false
      }

      // Category filter
      if (filterCategory !== 'ALL' && transaction.category?.id !== filterCategory) {
        return false
      }

      // Date range filter
      const transactionDate = new Date(transaction.createdAt)
      if (startDate && transactionDate < new Date(startDate)) {
        return false
      }
      if (endDate && transactionDate > new Date(endDate)) {
        return false
      }

      return true
    })
  }, [transactions, searchTerm, filterType, filterCategory, startDate, endDate])

  const handleDelete = async (transactionId: string) => {
    try {
      await deleteTransaction.mutateAsync(transactionId)
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('ALL')
    setFilterCategory('ALL')
    setStartDate('')
    setEndDate('')
  }


  return (
    <>
    {/* Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <Card className="p-6 mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-0 hover:bg-transparent cursor-pointer">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-semibold">Filtros</h2>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                  isFiltersOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Descrição..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <SelectTrigger id="type" className='cursor-pointer'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="INCOME">Receitas</SelectItem>
                    <SelectItem value="EXPENSE">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="category" className='cursor-pointer'>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={clearFilters} className='cursor-pointer'>
                Limpar Filtros
              </Button>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Transactions List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transação' : 'Transações'}
        </h2>
        {isLoading ? (
          <p>Carregando transações...</p>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 hidden lg:block rounded-full ${
                      transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-slate-500">
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      {transaction.category && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                            {transaction.category.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-col lg:flex-row">
                  <p 
                    className={`text-lg font-bold ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount), account?.currency || 'BRL')}
                  </p>
                  <div className="flex items-center ml-4 gap-2">
                    <EditTransactionDialog 
                      transaction={transaction}
                      accountId={accountId || ''}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Nenhuma transação encontrada</p>
        )}
      </Card>
    </>
  )
}