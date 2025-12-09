import { NavLink } from "react-router"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-center bold text-sm text-slate-500">
          &copy; {currentYear} AdmRef. All rights reserved.
        </p>
      </div>
    </footer>
  )
}