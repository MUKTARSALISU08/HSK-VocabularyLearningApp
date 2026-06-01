import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'wouter'
import {
  Home,
  BookOpen,
  Target,
  BarChart3,
  Heart,
  Menu,
  Search,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/lessons', label: 'Lessons', icon: BookOpen },
  { href: '/challenge', label: 'Challenge', icon: Target },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/search', label: 'Search', icon: Search },
]

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    setShowUserMenu(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header — hidden on desktop */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            汉
          </div>
          <span className="font-bold text-lg">HSK Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay — hidden on desktop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-background/95 backdrop-blur-sm p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <span
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-4 text-lg font-medium transition-all',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </span>
                </Link>
              )
            })}
            
            <div className="border-t mt-4 pt-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-accent"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate">{user?.username || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showUserMenu && 'rotate-180')} />
                </button>
                
                {showUserMenu && (
                  <div className="mt-2 py-2 bg-card border rounded-xl shadow-lg">
                    <Link href="/profile" onClick={() => { setMobileOpen(false); setShowUserMenu(false); }}>
                      <span className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </span>
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); setShowUserMenu(false); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-xl fixed left-0 top-0 h-screen">
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                汉
              </div>
              <div>
                <h1 className="font-bold text-lg">HSK Learning</h1>
                <p className="text-xs text-muted-foreground">Master Chinese</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="border-t p-3">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{user?.username || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showUserMenu && 'rotate-180')} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute bottom-full left-3 right-3 mb-2 py-2 bg-card border rounded-lg shadow-lg">
                    <Link href="/profile">
                      <span className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen md:ml-64">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}