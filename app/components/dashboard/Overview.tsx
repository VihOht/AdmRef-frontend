import { Card } from "~/components/ui/card";
import { CreditCard, TrendingUp } from "lucide-react";
import { useParams } from "react-router";
import { useAccount } from "~/hooks/use-finance";
import { useEffect, useState } from "react";
import { formatCurrency } from "~/lib/utils";

export function Overview() {
  const { accountId: paramAccountId } = useParams<{ accountId: string }>()
  const { data: account } = useAccount(paramAccountId || '')
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    if (account?.transactions) {
      const expenses = account.transactions.reduce((acc, transaction) =>
        transaction.type === 'EXPENSE' ? acc + Math.abs(transaction.amount) : acc, 0)
      const income = account.transactions.reduce((acc, transaction) =>
        transaction.type === 'INCOME' ? acc + Math.abs(transaction.amount) : acc, 0)
      setTotalExpenses(expenses)
      setTotalIncome(income)
    }
  }, [account?.transactions])

  return (
    <main className="flex-1 pb-20 lg:pb-8">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Acompanhe suas finanças em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500 mb-1">Receitas</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome, account?.currency || 'BRL')}
              </p>
            </div>
            <div className="bg-green-100 p-2 lg:p-3 rounded-full">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500 mb-1">Despesas</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses, account?.currency || 'BRL')}
              </p>
            </div>
            <div className="bg-red-100 p-2 lg:p-3 rounded-full">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 rotate-180" />
            </div>
          </div>
        </Card>

        <Card className="p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm text-slate-500 mb-1">Transações</p>
              <p className="text-xl lg:text-2xl font-bold text-primary">
                {account?.transactions?.length || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-full">
              <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">Transações Recentes</h2>
        {account?.transactions && account.transactions.length > 0 ? (
          <div className="space-y-2 lg:space-y-3">
            {account.transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-sm lg:text-base truncate">{transaction.description || 'Sem descrição'}</p>
                  <p className="text-xs lg:text-sm text-slate-500">
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p
                  className={`text-base lg:text-lg font-bold whitespace-nowrap ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount), account?.currency || 'BRL')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8 text-sm lg:text-base">
            Nenhuma transação encontrada
          </p>
        )}
      </Card>
    </main>
  )
}