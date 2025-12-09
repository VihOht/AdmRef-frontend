import { NavLink } from "react-router"
import { useAuth } from "~/providers"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { User, LogIn } from "lucide-react"

export function Header() {
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <header className="max-w-7xl mx-auto p-4">
    {/* Navigation */}
    <nav className="navbar bg-white rounded-lg shadow-lg mb-6 p-4 flex items-center justify-between">
        <div className="flex-1">
        <NavLink to="/" className="text-xl font-bold text-primary hover:opacity-80">
            AdmRef
        </NavLink>
        </div>
        
        <div className="flex-none flex items-center gap-4">
        {isAuthenticated ? (
            <>
            {/* Username Display */}
            <div className="hidden sm:flex items-center">
                <span className="text-sm text-slate-500 mr-2">Olá,</span>
                <span className="text-sm font-semibold text-primary">
                {user?.username}
                </span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52" align="end">
                <DropdownMenuLabel className="text-sm text-slate-500">
                    {user?.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <NavLink to="/profile" className="cursor-pointer">
                    Perfil
                    </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    Sair
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </>
        ) : (
            <NavLink to="/login">
            <Button size="sm">
                <LogIn className="w-4 h-4 mr-1" />
                Entrar
            </Button>
            </NavLink>
        )}
        </div>
    </nav>
    </header>
  )
}