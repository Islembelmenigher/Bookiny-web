import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/LanguageSelector';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.search'), path: '/search' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Booksy</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector variant="minimal" />
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                  <Link to="/dashboard">
                    <Calendar className="h-4 w-4 me-2" />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">{t('nav.myBookings')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">{t('nav.profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 me-2" />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                  <Link to="/auth">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild className="hidden md:flex">
                  <Link to="/auth?mode=signup">{t('nav.signup')}</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link to="/dashboard" className="text-lg font-medium hover:text-primary transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                      <Link to="/profile" className="text-lg font-medium hover:text-primary transition-colors">
                        {t('nav.profile')}
                      </Link>
                      <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
                        <LogOut className="h-4 w-4 me-2" />
                        {t('nav.logout')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link to="/auth">{t('nav.login')}</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/auth?mode=signup">{t('nav.signup')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-bold">Booksy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('auth.signInToContinue')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t('auth.client')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-foreground">{t('home.findServices')}</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">{t('nav.signup')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t('auth.business')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth?mode=signup&type=business" className="hover:text-foreground">{t('home.listBusiness')}</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground">{t('nav.dashboard')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 Booksy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
