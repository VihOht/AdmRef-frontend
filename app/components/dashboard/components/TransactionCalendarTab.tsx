import { useState, useMemo } from 'react'
import { useTransactions } from '~/hooks/use-finance'
import { Card } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import type { Transaction } from '~/types'

interface TransactionCalendarTabProps {
  accountId: string
}

interface DayTransaction {
  date: Date
  transactions: Transaction[]
  income: number
  expense: number
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export function TransactionCalendarTab({ accountId }: TransactionCalendarTabProps) {
  const { data: transactionsData } = useTransactions(accountId)
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [hoveredDayData, setHoveredDayData] = useState<DayTransaction | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const transactions = transactionsData?.transactions || []

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getDayTransactions = (month: number, day: number): DayTransaction => {
    const date = new Date(selectedYear, month, day)
    const dayTransactions = transactions.filter((t) => {
      const tDate = new Date(t.createdAt)
      return (
        tDate.getFullYear() === selectedYear &&
        tDate.getMonth() === month &&
        tDate.getDate() === day
      )
    })

    const income = dayTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)

    const expense = dayTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)

    return {
      date,
      transactions: dayTransactions,
      income,
      expense,
    }
  }

  const getMonthCalendar = (month: number) => {
    const firstDay = new Date(selectedYear, month, 1).getDay()
    const daysInMonth = new Date(selectedYear, month + 1, 0).getDate()
    const days: (DayTransaction | null)[] = []

    // Preencher dias vazios do mês anterior
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Preencher dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(getDayTransactions(month, day))
    }

    return days
  }

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear((prev) => prev - 1)
    } else {
      setSelectedMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((prev) => prev + 1)
    } else {
      setSelectedMonth((prev) => prev + 1)
    }
  }

  const handleToday = () => {
    setSelectedYear(today.getFullYear())
    setSelectedMonth(today.getMonth())
  }

  const handleDayHover = (dayIndex: number, day: DayTransaction, event: React.MouseEvent<HTMLButtonElement>) => {
    if (day.transactions.length > 0) {
      setHoveredDay(dayIndex)
      setHoveredDayData(day)
      
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + 8,
      })
    }
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
    setHoveredDayData(null)
  }

  const monthCalendar = useMemo(() => {
    return getMonthCalendar(selectedMonth)
  }, [selectedYear, selectedMonth, transactions])

  const monthSummary = useMemo(() => {
    const income = monthCalendar
      .filter((d) => d !== null)
      .reduce((acc, day) => acc + (Math.abs(day?.income) || 0), 0)
    
      console.log('CALCULATED INCOME:', income)

    const expense = monthCalendar
      .filter((d) => d !== null)
      .reduce((acc, day) => acc + (Math.abs(day?.expense) || 0), 0)

    return { income, expense }
  }, [monthCalendar])

  return (
    <div className="space-y-6">
      {/* Month Navigation and Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="icon" className='cursor-pointer' onClick={handlePreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 min-w-[300px] text-center">
              {MONTHS[selectedMonth]} {selectedYear}
            </h2>
            <Button variant="outline" size="sm" className='cursor-pointer' onClick={handleToday}>
              Hoje
            </Button>
          </div>

          <Button variant="outline" size="icon" className='cursor-pointer' onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Month Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-600">Receitas do mês</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(monthSummary.income)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-slate-600">Despesas do mês</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(monthSummary.expense)}
            </p>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6 relative">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {monthCalendar.map((day, dayIndex) => {
            if (!day) {
              return <div key={`empty-${dayIndex}`} className="" />
            }

            const hasTransactions = day.transactions.length > 0
            const isToday =
              today.getFullYear() === selectedYear &&
              today.getMonth() === selectedMonth &&
              today.getDate() === day.date.getDate()

            console.log('DAY DATA:', day)
            const isPositive = day.income >= day.expense

            const isHovered = hoveredDay === dayIndex

            return (
              <button
                key={dayIndex}
                onMouseEnter={(e) => handleDayHover(dayIndex, day, e)}
                onMouseLeave={handleDayLeave}
                className={`rounded p-1 flex flex-col items-center justify-center cursor-pointer transition-all font-semibold 
                  aspect-square border
                  ${isToday ? 'bg-primary text-white' : 'hover:bg-slate-100'}
                  ${hasTransactions ? (isPositive ? 'bg-green-100' : 'bg-red-100') : 'text-slate-600'}
                  ${isHovered ? 'scale-105 shadow-lg z-10' : ''}
                  `}
              >
                <span>{day.date.getDate()}</span>
                {hasTransactions && (
                  <div className="flex gap-0.5 mt-0.5">
                    {day.income > 0 && (
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                    )}
                    {day.expense > 0 && (
                      <div className="w-1 h-1 bg-red-500 rounded-full" />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Tooltip */}
        {hoveredDayData && (
          <div
            className="fixed bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 w-72"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <h3 className="font-semibold text-sm mb-2 text-slate-800">
              {hoveredDayData.date.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </h3>

            {/* Day Summary - Simplificado */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="text-xs text-slate-600">Receitas</div>
                <div className="text-sm font-bold text-green-600">
                  {formatCurrency(hoveredDayData.income)}
                </div>
              </div>
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <div className="text-xs text-slate-600">Despesas</div>
                <div className="text-sm font-bold text-red-600">
                  {formatCurrency(hoveredDayData.expense)}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {hoveredDayData.transactions.map((transaction, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded text-xs flex justify-between items-start gap-2 ${
                    transaction.type === 'INCOME'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <span className="font-medium truncate flex-1">
                    {transaction.description || 'Sem descrição'}
                  </span>
                  <span
                    className={`font-bold whitespace-nowrap ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}