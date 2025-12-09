import { Card } from "~/components/ui/card";
import { CreditCard, TrendingUp } from "lucide-react";
import { useParams } from "react-router";
import { useAccount } from "~/hooks/use-finance";
import { useEffect, useState } from "react";
import { formatCurrency } from "~/lib/utils";



export default function Overview() {
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
    <main className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-600 mt-2">Acompanhe suas finanças em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome, account?.currency || 'BRL')}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses, account?.currency || 'BRL')}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-red-600 rotate-180" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Transações</p>
              <p className="text-2xl font-bold text-primary">
                {account?.transactions?.length || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Transações Recentes</h2>
        {account?.transactions && account.transactions.length > 0 ? (
          <div className="space-y-3">
            {account.transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <p
                  className={`text-lg font-bold ${
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
          <p className="text-slate-500 text-center py-8">
            Nenhuma transação encontrada
          </p>
        )}
      </Card>
    </main>
  )
}