import { useState, useEffect } from 'react'
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
import { Edit } from 'lucide-react'
import { useUpdateCategory } from '~/hooks/use-finance'
import { TypesTransactionCategory } from '~/types'
import type { Category, UpdateCategoryDto } from '~/types'

interface EditCategoryDialogProps {
  category: Category
  accountId: string
  button?: React.ReactNode
}

export function EditCategoryDialog({
  category,
  accountId,
  button,
}: EditCategoryDialogProps) {
  if (!accountId) {
    throw new Error('accountId is required to edit a category')
  }

  const [open, setOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDomain, setCategoryDomain] = useState<TypesTransactionCategory>(TypesTransactionCategory.EXPENSE)
  const [categoryDescription, setCategoryDescription] = useState('')
  const { mutate: updateCategory, isPending: isLoading } = useUpdateCategory(accountId, category.id)

  // Populate form with category data when dialog opens
  useEffect(() => {
    if (open) {
      setCategoryName(category.name)
      setCategoryDomain(category.domain)
      setCategoryDescription(category.description || '')
    }
  }, [open, category])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryName) return
    if (isLoading) return

    try {
      updateCategory({
        id: category.id,
        name: categoryName,
        domain: categoryDomain,
        description: categoryDescription,
      } as UpdateCategoryDto)

      setOpen(false)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {button || (
        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 cursor-pointer">
          <Edit className="w-4 h-4" />
          <span className="sr-only">Editar Categoria</span>
        </Button>
        )}
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da categoria
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
                <SelectTrigger id="categoryDomain" className='cursor-pointer'>
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
              className='cursor-pointer'
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !categoryName}
              className='cursor-pointer'
            >
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}