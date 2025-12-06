import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, User, LogOut, Menu, CreditCard } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSelector } from '@/components/LanguageSelector';
import { NotificationPanel } from '@/components/NotificationPanel';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsBusinessOwner(data?.role === 'business_owner');
      }
    };
    checkUserRole();
  }, [user]);

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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl text-foreground">BookEase</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="minimal" />
            
            {user ? (
              <>
                <NotificationPanel />
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
                    {isBusinessOwner && (
                      <DropdownMenuItem asChild>
                        <Link to="/payment">
                          <CreditCard className="h-4 w-4 me-2" />
                          Subscription
                        </Link>
                      </DropdownMenuItem>
                    )}
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
                      {isBusinessOwner && (
                        <Link to="/payment" className="text-lg font-medium hover:text-primary transition-colors flex items-center">
                          <CreditCard className="h-4 w-4 me-2" />
                          Subscription
                        </Link>
                      )}
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
      <footer className="border-t border-border bg-card">
        <div className="container py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-display font-bold text-lg">BookEase</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('auth.signInToContinue')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">{t('auth.client')}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/search" className="hover:text-primary transition-colors">{t('home.findServices')}</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">{t('nav.signup')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">{t('auth.business')}</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/auth?mode=signup&type=business" className="hover:text-primary transition-colors">{t('home.listBusiness')}</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">{t('nav.dashboard')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 BookEase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
