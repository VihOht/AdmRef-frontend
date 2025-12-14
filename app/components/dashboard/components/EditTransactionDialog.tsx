import { useState, useEffect, use } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus } from 'lucide-react'
import { Edit, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { TypesTransactionCategory, type Transaction, type UpdateTransactionDto } from '~/types'
import { useCategories, useUpdateTransaction, useCategory } from '~/hooks/use-finance'
import { EditCategoryDialog } from './EditCategoryDialog'

interface EditTransactionDialogProps {
  transaction: Transaction
  accountId: string,
  button?: React.ReactNode
}

export function EditTransactionDialog({
  transaction,
  accountId,
  button,
}: EditTransactionDialogProps) {
  if (!accountId) {
    throw new Error('accountId is required to edit a transaction')
  }

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionType, setTransactionType] = useState<TypesTransactionCategory>(TypesTransactionCategory.EXPENSE)
  const [categoryId, setCategoryId] = useState('')
  const { data: categoriesData } = useCategories(accountId)
  const categories = categoriesData?.categories || []
  const { mutate: updateTransaction, isPending: isLoading } = useUpdateTransaction(accountId, transaction.id)
  const [category, setCategory] = useState<ReturnType<typeof useCategory>['data']>()
  const {mutate: getCategory, data: categoryData} = useCategory(accountId)

  // Populate form with transaction data when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(Math.abs(transaction.amount).toString())
      setDescription(transaction.description || '')
      setTransactionType(transaction.type)
      setCategoryId(transaction.categoryId || '')
      if (transaction.categoryId) {
        getCategory(transaction.categoryId)
      } else {
        setCategory(undefined)
      }
    }
  }, [open, transaction])

  useEffect(() => {
    if (categoryData) {
      setCategory(categoryData)
    }
  }, [categoryData])



  useEffect(() => {
    if (categoryId) {
      getCategory(categoryId)
    } else {
      setCategory(undefined)
    }
  }, [categoryId, getCategory])

  const filteredCategories = categories.filter((cat) => cat.domain === transactionType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) return
    if (isLoading) return

    try {
      const parsedAmount = parseFloat(amount)
      const finalAmount = transactionType === 'EXPENSE' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)

      updateTransaction({
        id: transaction.id,
        amount: finalAmount,
        description,
        categoryId: categoryId || undefined,
      } as UpdateTransactionDto)

      setOpen(false)
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }
  console.log('Selected category for edit:', category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {button || (
          <Button variant="ghost" size="icon" className='cursor-pointer'>
            <Edit className="w-4 h-4" />
            <span className="sr-only">Editar Transação</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da transação
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className='cursor-pointer position absolute top-3 right-3 text-xl text-slate-500 hover:text-slate-700'>
              <span className="sr-only">Fechar</span>
              &times;
            </Button>
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transactionType">Tipo</Label>
              <Select 
                value={transactionType} 
                onValueChange={(value) => {
                  setTransactionType(value as TypesTransactionCategory)
                  setCategoryId('')
                }}
              >
                <SelectTrigger id="transactionType" className='cursor-pointer'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">
                    <div className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-red-600" />
                      Despesa
                    </div>
                  </SelectItem>
                  <SelectItem value="INCOME">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4 text-green-600" />
                      Receita
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-slate-500">
                {transactionType === 'EXPENSE' ? 'Insira o valor como positivo (será convertido em despesa)' : 'Insira o valor como positivo (será convertido em receita)'}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Aluguel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria (Opcional)</Label>
              <div className="flex gap-2">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="flex-1 cursor-pointer">
                    <SelectValue placeholder={`Selecione uma ${transactionType === 'EXPENSE' ? 'despesa' : 'receita'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-slate-500">
                        Nenhuma categoria
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {(categoryId && category) && (
                  <EditCategoryDialog
                    accountId={accountId}
                    category={category}
                    button={
                      <Button variant="outline" size="icon" className='cursor-pointer'>
                        <Edit className="w-4 h-4" />
                      </Button>
                    }
                  />
                )}
                <CreateCategoryDialog
                  defaultDomain={transactionType}
                  accountId={accountId}
                  button={
                    <Button variant="outline" size="sm" className='cursor-pointer'>
                      <Plus className="w-4 h-4 mr-1" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className='cursor-pointer' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className='cursor-pointer' disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}