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
import { useCreateAccount, useCurrencies } from '~/hooks/use-finance'
import { Plus } from 'lucide-react'
import type { CreateAccountDto, Currency } from '~/types'

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<Currency | ''>('')

  const { data: currenciesData } = useCurrencies()
  const createAccount = useCreateAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !currency) {
      return
    }

    try {
      await createAccount.mutateAsync({
        name,
        currency,
      } as CreateAccountDto)

      // Reset form and close dialog
      setName('')
      setCurrency('')
      setOpen(false)
    } catch (error) {
      console.error('Error creating account:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta financeira para gerenciar suas transações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                placeholder="Ex: Conta Corrente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as Currency)}
                required
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {currenciesData?.currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              disabled={createAccount.isPending || !name || !currency}
            >
              {createAccount.isPending ? 'Criando...' : 'Criar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}