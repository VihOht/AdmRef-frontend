import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router'
import { useCategories, useDeleteCategory, useTransactions } from '~/hooks/use-finance'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { TypesTransactionCategory } from '~/types'

export default function Categories() {
  const { accountId } = useParams<{ accountId: string }>()
  const { data: categoriesData, refetch: refetchCategories } = useCategories(accountId || '')
  const { data: transactionsData } = useTransactions(accountId || '')
  const deleteCategory = useDeleteCategory(accountId || '')
  const [activeTab, setActiveTab] = useState<TypesTransactionCategory>(TypesTransactionCategory.EXPENSE)
  const [allTransactionsWithoutCategory, setAllTransactionsWithoutCategory] = useState(false)

  const categories = categoriesData?.categories || []

  useEffect(() => {
    const allTransactionsWithoutCategoryQuery = transactionsData?.transactions.filter(
      (transaction) => !transaction.category
    ) || []
    setAllTransactionsWithoutCategory(allTransactionsWithoutCategoryQuery.length > 0)
  }, [transactionsData])

  // Calcular totais por categoria
  const expenseCategories = useMemo(() => {
    const expenseCategories = categories
      .filter((cat) => cat.domain === TypesTransactionCategory.EXPENSE)
      .map((cat) => {
        const total = cat.transactions?.reduce((acc, trans) => acc + Math.abs(trans.amount), 0) || 0
        return { ...cat, total }
      })
      .sort((a, b) => b.total - a.total)

    const uncategorizedExpenseTransactions = transactionsData?.transactions.filter(
      (transaction) => transaction.type === 'EXPENSE' && !transaction.category
    ) || []
    
    if (uncategorizedExpenseTransactions.length > 0) {
        const uncategorizedTotal = uncategorizedExpenseTransactions.reduce(
            (acc, transaction) => acc + Math.abs(transaction.amount), 0
        )
        expenseCategories.unshift({
            id: 'uncategorized',
            accountId: accountId || '',
            name: 'Sem Categoria',
            domain: TypesTransactionCategory.EXPENSE, 
            description: 'Transações sem categoria atribuída',
            createdAt: '',
            updatedAt: '',
            total: uncategorizedTotal,
            transactions: uncategorizedExpenseTransactions,
        })
    }

    return expenseCategories
  }, [categories, transactionsData, accountId])

  const incomeCategories = useMemo(() => {
    const incomeCategories = categories
      .filter((cat) => cat.domain === 'INCOME')
      .map((cat) => {
        const total = cat.transactions?.reduce((acc, trans) => acc + Math.abs(trans.amount), 0) || 0
        return { ...cat, total }
      })
      .sort((a, b) => b.total - a.total)

    const uncategorizedIncomeTransactions = transactionsData?.transactions.filter(
      (transaction) => transaction.type === 'INCOME' && !transaction.category
    ) || []

    if (uncategorizedIncomeTransactions.length > 0) {
      const uncategorizedTotal = uncategorizedIncomeTransactions.reduce(
        (acc, transaction) => acc + Math.abs(transaction.amount), 0
      )
      incomeCategories.unshift({
        id: 'uncategorized',
        accountId: accountId || '',
        name: 'Sem Categoria',
        domain: TypesTransactionCategory.INCOME,
        description: 'Transações sem categoria atribuída',
        createdAt: '',
        updatedAt: '',
        total: uncategorizedTotal,
        transactions: uncategorizedIncomeTransactions,
      })
    }

    return incomeCategories

  }, [categories])

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory.mutateAsync(categoryId)
      refetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const totalExpenses = expenseCategories.reduce((acc, cat) => acc + cat.total, 0)
  const totalIncomes = incomeCategories.reduce((acc, cat) => acc + cat.total, 0)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getPercentage = (value: number, total: number): number => {
    return total === 0 ? 0 : (value / total) * 100
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Categorias</h1>
          <p className="text-slate-600 mt-2">Gerencie e visualize suas categorias</p>
        </div>
        <CreateCategoryDialog defaultDomain={activeTab} accountId={accountId || ''} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TypesTransactionCategory)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value={TypesTransactionCategory.EXPENSE} className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value={TypesTransactionCategory.INCOME} className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Receitas
          </TabsTrigger>
        </TabsList>

        {/* Expense Categories Tab */}
        <TabsContent value="EXPENSE" className="space-y-4 mt-6">
          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">Total de Despesas</p>
                <h2 className="text-3xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </h2>
              </div>
              <div className="bg-red-100 p-4 rounded-full">
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Categories List */}
          {expenseCategories.length > 0 ? (
            <div className="space-y-3">
              {expenseCategories.map((category) => (
                <Card key={category.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {category.transactions?.length || 0} {category.transactions?.length === 1 ? 'transação' : 'transações'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-slate-500 mb-3">{category.description}</p>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Gasto</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(category.total)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${getPercentage(category.total, totalExpenses)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {getPercentage(category.total, totalExpenses).toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-500 mb-4">Nenhuma categoria de despesa criada</p>
              <CreateCategoryDialog defaultDomain={TypesTransactionCategory.EXPENSE} accountId={accountId || ''}/>
            </Card>
          )}
        </TabsContent>

        {/* Income Categories Tab */}
        <TabsContent value="INCOME" className="space-y-4 mt-6">
          {/* Summary Card */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">Total de Receitas</p>
                <h2 className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalIncomes)}
                </h2>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Categories List */}
          {incomeCategories.length > 0 ? (
            <div className="space-y-3">
              {incomeCategories.map((category) => (
                <Card key={category.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {category.transactions?.length || 0} {category.transactions?.length === 1 ? 'transação' : 'transações'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-slate-500 mb-3">{category.description}</p>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Receita</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(category.total)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${getPercentage(category.total, totalIncomes)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {getPercentage(category.total, totalIncomes).toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-500 mb-4">Nenhuma categoria de receita criada</p>
              <CreateCategoryDialog defaultDomain={TypesTransactionCategory.INCOME} accountId={accountId || ''} />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}