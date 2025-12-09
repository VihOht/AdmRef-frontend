import { NavLink, Navigate } from "react-router"
import { useParams } from "react-router"
import { useAuth } from "~/providers"
import { useAccount } from "~/hooks/use-finance"
import { Footer } from "~/components/Footer"
import { Button } from "~/components/ui/button"
import { formatCurrency } from "~/lib/utils"
import Overview from "~/components/dashboard/Overview"
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Tags, 
  Settings,
  ArrowLeftRight
} from "lucide-react"
import { useState } from "react"
import Transactions from "~/components/dashboard/Transactions"
import Categories from "~/components/dashboard/Categories"

export function meta() {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'User dashboard page' },
  ]
}

export default function DashboardRoute() {
  const { accountId } = useParams<{ accountId: string }>()
  const { isAuthenticated } = useAuth()
  const { data: account, isLoading, isError } = useAccount(accountId || '')
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!accountId) {
    return <Navigate to="/home" replace />
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6">
          <div className="mb-8">
            {isLoading ? (
              <div className="h-8 bg-slate-200 rounded animate-pulse" />
            ) : isError ? (
              <p className="text-sm text-red-500">Erro ao carregar conta</p>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-800">{account?.name}</h2>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formatCurrency(account?.balance || 0, account?.currency || 'BRL')}
                </p>
              </>
            )}
          </div>

          <nav className="space-y-2">
            <Button
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full justify-start
              "
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => handleTabChange('overview')
              }
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Visão Geral</span>
            </Button>

            <Button
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('transactions')}
            >
              <ArrowLeftRight className="w-5 h-5" />
              <span className="font-medium">Transações</span>
            </Button>

            <Button
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('categories')}
            >
              <Tags className="w-5 h-5" />
              <span className="font-medium">Categorias</span>
            </Button>

            <Button
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('analytics')}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Análises</span>
            </Button>

            <Button
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => handleTabChange('settings')}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </Button>
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <NavLink to="/">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </NavLink>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6"> 
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'analytics' && <div>Analytics Component</div>}
          {activeTab === 'settings' && <div>Settings Component</div>}
        </main>
      </div>

      <Footer />
    </div>
  )
}