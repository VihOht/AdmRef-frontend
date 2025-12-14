import { useState } from 'react'
import { useParams } from 'react-router'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@radix-ui/react-tabs'
import { CreateTransactionDialog, TransactionCalendarTab, TransactionTableTab } from './components'

export function Transactions() {
  const { accountId } = useParams<{ accountId: string }>()
  const [activeTab, setActiveTab] = useState('tables')

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Transações</h1>
          <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Gerencie todas as suas transações</p>
        </div>
        <CreateTransactionDialog accountId={accountId || ''} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 border-b border-slate-200 w-full overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <TabsTrigger
              value="tables"
              className={`px-3 lg:px-4 py-2 -mb-px font-medium text-sm lg:text-base whitespace-nowrap cursor-pointer ${
                activeTab === 'tables'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tabela
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className={`px-3 lg:px-4 py-2 -mb-px font-medium text-sm lg:text-base whitespace-nowrap cursor-pointer ${
                activeTab === 'calendar'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Calendário
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="tables">
          <TransactionTableTab accountId={accountId || ''} />
        </TabsContent>

        <TabsContent value="calendar">
          <TransactionCalendarTab accountId={accountId || ''} />
        </TabsContent>
      </Tabs>
    </div>
  )
}