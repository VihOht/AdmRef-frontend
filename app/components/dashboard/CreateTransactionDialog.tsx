import { useState } from 'react'
import {
  Dialog,
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
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { CreateCategoryDialog } from './CreateCategoryDialog'
import { TypesTransactionCategory, type CreateTransactionDto } from '~/types'
import { useCategories } from '~/hooks/use-finance'
import { useCreateTransaction } from '~/hooks/use-finance'


interface CreateTransactionDialogProps {
  defaultType?: TypesTransactionCategory
  accountId: string
}

export function CreateTransactionDialog({
    defaultType = TypesTransactionCategory.EXPENSE,
    accountId,}: CreateTransactionDialogProps
) {
    if (!accountId) {
      throw new Error('accountId is required to create a transaction')
    }

  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionType, setTransactionType] = useState<TypesTransactionCategory>(defaultType)
  const [categoryId, setCategoryId] = useState('')
  const { data: categoriesData } = useCategories(accountId)
  const categories = categoriesData?.categories || []
  const {mutate: createTransaction, isPending: isLoading} = useCreateTransaction(accountId)



  const filteredCategories = categories.filter((cat) => cat.domain === transactionType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) return
    if (isLoading) return

    try {
      const parsedAmount = parseFloat(amount)
      const finalAmount = transactionType === 'EXPENSE' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount)

      createTransaction({
        amount: finalAmount,
        description,
        categoryId: categoryId || undefined,
      } as CreateTransactionDto)

      // Reset form
      setAmount('')
      setDescription('')
      setTransactionType(TypesTransactionCategory.EXPENSE)
      setCategoryId('')
      setOpen(false)
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova transação à sua conta
          </DialogDescription>
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
                <SelectTrigger id="transactionType">
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
                  <SelectTrigger id="category" className="flex-1">
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
                <CreateCategoryDialog
                  defaultDomain={transactionType}
                  accountId={accountId}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}