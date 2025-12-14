import { useState, useMemo } from 'react'
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
import { EditCategoryDialog, CreateCategoryDialog, CreateTransactionDialog } from './components'
import { TypesTransactionCategory } from '~/types'

export function Categories() {
  const { accountId } = useParams<{ accountId: string }>()
  const { data: categoriesData, refetch: refetchCategories } = useCategories(accountId || '')
  const { data: transactionsData } = useTransactions(accountId || '')
  const deleteCategory = useDeleteCategory(accountId || '')
  const [activeTab, setActiveTab] = useState<TypesTransactionCategory>(TypesTransactionCategory.EXPENSE)
  const categories = categoriesData?.categories || []

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
  }, [categories, transactionsData])

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
    <div className="pb-20 lg:pb-8">
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Categorias</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Gerencie e visualize suas categorias</p>
        </div>
        <CreateCategoryDialog defaultDomain={activeTab} accountId={accountId || ''} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TypesTransactionCategory)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value={TypesTransactionCategory.EXPENSE} className="flex items-center gap-2 text-sm lg:text-base cursor-pointer">
            <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value={TypesTransactionCategory.INCOME} className="flex items-center gap-2 text-sm lg:text-base cursor-pointer">
            <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
            Receitas
          </TabsTrigger>
        </TabsList>

        {/* Expense Categories Tab */}
        <TabsContent value="EXPENSE" className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
          {/* Summary Card */}
          <Card className="p-4 lg:p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-slate-600 mb-1 lg:mb-2">Total de Despesas</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </h2>
              </div>
              <div className="bg-red-100 p-3 lg:p-4 rounded-full">
                <TrendingDown className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Categories List */}
          {expenseCategories.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {expenseCategories.map((category) => (
                <Card key={category.id} className="p-3 lg:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm lg:text-base text-slate-800 truncate">{category.name}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded whitespace-nowrap">
                          {category.transactions?.length || 0} {category.transactions?.length === 1 ? 'transação' : 'transações'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs lg:text-sm text-slate-500 mb-2 lg:mb-3 line-clamp-2">{category.description}</p>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs lg:text-sm mb-1">
                          <span className="text-slate-600">Gasto</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(category.total)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 lg:h-2">
                          <div
                            className="bg-red-500 h-1.5 lg:h-2 rounded-full transition-all"
                            style={{ width: `${getPercentage(category.total, totalExpenses)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {getPercentage(category.total, totalExpenses).toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <CreateTransactionDialog
                        defaultCategoryId={category.id === 'uncategorized' ? undefined : category.id}
                        defaultType={TypesTransactionCategory.EXPENSE}
                        accountId={accountId || ''}
                        button={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-800 cursor-pointer">
                            <Plus className="w-4 h-4" />
                          </Button>
                        }
                      />
                      {category.id !== 'uncategorized' && (
                        <>
                          <EditCategoryDialog category={category} accountId={accountId || ''} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(category.id)} className="w-full sm:w-auto">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 lg:p-8 text-center">
              <p className="text-sm lg:text-base text-slate-500 mb-4">Nenhuma categoria de despesa criada</p>
              <CreateCategoryDialog defaultDomain={TypesTransactionCategory.EXPENSE} accountId={accountId || ''}/>
            </Card>
          )}
        </TabsContent>

        {/* Income Categories Tab */}
        <TabsContent value="INCOME" className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
          {/* Summary Card */}
          <Card className="p-4 lg:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm text-slate-600 mb-1 lg:mb-2">Total de Receitas</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-green-600">
                  {formatCurrency(totalIncomes)}
                </h2>
              </div>
              <div className="bg-green-100 p-3 lg:p-4 rounded-full">
                <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Categories List */}
          {incomeCategories.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {incomeCategories.map((category) => (
                <Card key={category.id} className="p-3 lg:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm lg:text-base text-slate-800 truncate">{category.name}</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded whitespace-nowrap">
                          {category.transactions?.length || 0} {category.transactions?.length === 1 ? 'transação' : 'transações'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs lg:text-sm text-slate-500 mb-2 lg:mb-3 line-clamp-2">{category.description}</p>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs lg:text-sm mb-1">
                          <span className="text-slate-600">Receita</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(category.total)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 lg:h-2">
                          <div
                            className="bg-green-500 h-1.5 lg:h-2 rounded-full transition-all"
                            style={{ width: `${getPercentage(category.total, totalIncomes)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {getPercentage(category.total, totalIncomes).toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <CreateTransactionDialog
                        defaultCategoryId={category.id === 'uncategorized' ? undefined : category.id}
                        defaultType={TypesTransactionCategory.INCOME}
                        accountId={accountId || ''}
                        button={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-800 cursor-pointer">
                            <Plus className="w-4 h-4" />
                          </Button>
                        }
                      />
                      {category.id !== 'uncategorized' && (
                        <>
                          <EditCategoryDialog category={category} accountId={accountId || ''} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a categoria "{category.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(category.id)} className="w-full sm:w-auto">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 lg:p-8 text-center">
              <p className="text-sm lg:text-base text-slate-500 mb-4">Nenhuma categoria de receita criada</p>
              <CreateCategoryDialog defaultDomain={TypesTransactionCategory.INCOME} accountId={accountId || ''} />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}