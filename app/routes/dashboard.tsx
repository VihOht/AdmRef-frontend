import { NavLink, Navigate } from "react-router"
import { useParams } from "react-router"
import { useAuth } from "~/providers"
import { useAccount } from "~/hooks/use-finance"
import { Footer } from "~/components/Footer"
import { Button } from "~/components/ui/button"
import { formatCurrency } from "~/lib/utils"
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Tags, 
  Settings,
  ArrowLeftRight,
  Menu,
  X
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { Overview, Transactions, Categories } from "~/components/dashboard"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"

export function meta() {
  return [
    { title: 'Dashboard' },
    { name: 'description', content: 'User dashboard page' },
  ]
}

export default function DashboardRoute() {
  const { accountId } = useParams<{ accountId: string }>()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: account, isLoading: accountLoading, isError: accountError } = useAccount(accountId || '')
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (accountError) {
      toast.error('Erro ao carregar a conta.')
      navigate('/')
    }
  }, [accountError])

  if (authLoading || accountLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    toast.error('Você precisa estar logado para acessar o dashboard.')
    return <Navigate to="/login" replace />
  }

  if (!accountId) {
    toast.error('Conta não encontrada.')
    return <Navigate to="/" replace />
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: Home },
    { id: 'transactions', label: 'Transações', icon: ArrowLeftRight },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'analytics', label: 'Análises', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      <div className={`${isMobile ? 'mb-6 p-4' : 'mb-8'}`}>
        {accountLoading ? (
          <div className="h-8 bg-slate-200 rounded animate-pulse" />
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-800">{account?.name}</h2>
            <p className="text-2xl font-bold text-primary mt-2">
              {formatCurrency(account?.balance || 0, account?.currency || 'BRL')}
            </p>
          </>
        )}
      </div>

      <nav className={`space-y-2 ${isMobile ? 'p-4' : ''}`}>
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full justify-start cursor-pointer"
            variant={activeTab === item.id ? 'default' : 'ghost'}
            onClick={() => handleTabChange(item.id)}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Button>
        ))}
      </nav>

      <div className={`${isMobile ? 'mt-6 pt-6 p-4' : 'mt-8 pt-8'} border-t border-slate-200`}>
        <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <Button variant="outline" className="w-full cursor-pointer">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </NavLink>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800">{account?.name}</h2>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(account?.balance || 0, account?.currency || 'BRL')}
            </p>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost"  size="icon" className='cursor-pointer'>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader >
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SidebarContent isMobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 p-6">
          <SidebarContent />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 w-full overflow-x-hidden"> 
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'transactions' && <Transactions />}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Análises</h3>
              <p className="text-slate-500">Em desenvolvimento...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Configurações</h3>
              <p className="text-slate-500">Em desenvolvimento...</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-1 cursor-pointer ${
                activeTab === item.id ? 'text-primary' : 'text-slate-600'
              }`}
              onClick={() => handleTabChange(item.id)}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Footer - Hidden on mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}