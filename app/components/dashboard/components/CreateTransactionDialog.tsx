import { use, useEffect, useState } from 'react'
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
import { Plus, ArrowDownCircle, ArrowUpCircle, Edit } from 'lucide-react'
import { CreateCategoryDialog, EditCategoryDialog } from './'
import { TypesTransactionCategory, type CreateTransactionDto } from '~/types'
import { useCategories, useCreateTransaction, useCategory } from '~/hooks/use-finance'
import { DialogClose } from '@radix-ui/react-dialog'



interface CreateTransactionDialogProps {
  defaultCategoryId?: string
  defaultType?: TypesTransactionCategory
  accountId: string,
  button?: React.ReactNode
}

export function CreateTransactionDialog({
    defaultCategoryId,
    defaultType = TypesTransactionCategory.EXPENSE,
    accountId,
    button,
  }: CreateTransactionDialogProps
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
  const [category, setCategory] = useState<ReturnType<typeof useCategory>['data']>()
  const {mutate: getCategory, data: categoryData} = useCategory(accountId)
  const {mutate: createTransaction, isPending: isLoading} = useCreateTransaction(accountId)



  const filteredCategories = categories.filter((cat) => cat.domain === transactionType)

  useEffect(() => {
    if (defaultType) {
      setTransactionType(defaultType)
    }
    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId)
    }
  }, [defaultType, defaultCategoryId]) 

  useEffect(() => {
    if (categoryId) {
      getCategory(categoryId)
    } else {
      setCategory(undefined)
    }
  }, [categoryId, getCategory])

   useEffect(() => {
    if (categoryData) {
      setCategory(categoryData)
    }
  }, [categoryData])

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
        {button || (
        <Button className='cursor-pointer'>
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Criar Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova transação à sua conta
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
                      <div className="p-4 text-sm text-slate-500">
                        Nenhuma categoria disponível. Crie uma nova categoria.
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
                    <Button variant="outline" size="icon" className='cursor-pointer'>
                      <Plus className="w-4 h-4" />
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
              {isLoading ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}