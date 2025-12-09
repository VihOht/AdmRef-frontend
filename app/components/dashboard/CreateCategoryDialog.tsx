import { useEffect, useState } from 'react'
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
import { Plus } from 'lucide-react'
import { TypesTransactionCategory } from '~/types'
import { useCreateCategory } from '~/hooks/use-finance'


interface CreateCategoryDialogProps {
  defaultDomain?: TypesTransactionCategory
  accountId: string
}

export function CreateCategoryDialog({
  defaultDomain = TypesTransactionCategory.EXPENSE,
  accountId,
}: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDomain, setCategoryDomain] = useState<TypesTransactionCategory>(defaultDomain)
  const [categoryDescription, setCategoryDescription] = useState('')

  const {mutate: createCategory, isPending: isLoading} = useCreateCategory(accountId)

  useEffect(() => {
    setCategoryDomain(defaultDomain)
  }, [defaultDomain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryName || isLoading) return
    
    try {
      createCategory({
        name: categoryName,
        domain: categoryDomain,
        description: categoryDescription,
      })

      // Reset form
      setCategoryName('')
      setCategoryDomain(defaultDomain)
      setCategoryDescription('')
      setOpen(false)
   
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar suas transações
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Alimentação"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryDomain">Tipo</Label>
              <Select 
                value={categoryDomain} 
                onValueChange={(value) => setCategoryDomain(value as TypesTransactionCategory)}
              >
                <SelectTrigger id="categoryDomain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryDescription">Descrição (Opcional)</Label>
              <Input
                id="categoryDescription"
                placeholder="Descrição da categoria"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !categoryName}
            >
              {isLoading ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}