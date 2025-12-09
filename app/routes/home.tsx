import { useAuth } from '~/providers'
import { Navigate, NavLink } from 'react-router'
import { Header } from '~/components/Header'
import type { Route } from './+types/home'
import { Card } from '~/components/ui/card'
import { Footer } from '~/components/Footer'
import { useAccounts } from '~/hooks/use-finance'
import { Button } from '~/components/ui/button'
import { CreateAccountDialog } from '~/components/CreateAccountDialog'
import { formatCurrency } from '~/lib/utils'


export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Home' },
    { name: 'description', content: 'Welcome to the home page' },
  ]
}



export default function HomeRoute() {
  const { isAuthenticated, logout, user } = useAuth()

  const { data: accounts, isLoading, isError, error } = useAccounts()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6 py-4">
          <h1 className='text-4xl font-bold text-primary text-center '>Painel Administrativo</h1>
          <p className="text-gray-600 mt-6 text-center">Gerencie suas referências de forma eficiente</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Contas Financeiras</h2>
          {isLoading ? (
            <p>Carregando contas...</p>
          ) : isError ? (
            <p>Erro ao carregar contas. {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
          ) : accounts && accounts.length > 0 ? (
            <ul className="space-y-2">
              {accounts.map((account) => (
                <li key={account.id} className="p-4 border rounded-lg hover:shadow flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{account.name}</h3>
                      <p className="text-sm text-gray-500">Saldo: {formatCurrency(account.balance, account.currency)}</p>
                    </div>
                  <NavLink to={`/dashboard/${account.id}`}> 
                    <Button className="mt-2">Acessar</Button> 
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma conta encontrada.</p>
          )}
          <div>
            <CreateAccountDialog />
          </div>
        </Card>
      </main>
      <Footer />
    </>
  )
}
