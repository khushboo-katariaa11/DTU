import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation, getDashboardLink } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const isActive = (path: string) => location === path;
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <a className="flex items-center gap-2">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="font-bold text-xl">EduAble</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-foreground/60'}`}>
                Home
              </a>
            </Link>
            <Link href="/courses">
              <a className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/courses') ? 'text-primary' : 'text-foreground/60'}`}>
                Courses
              </a>
            </Link>
            <a 
              href="#about" 
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              About
            </a>
            <a 
              href="#testimonials" 
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-primary"
            >
              Testimonials
            </a>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link href={getDashboardLink()}>
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/auth?tab=register">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b">
                <Link href="/" onClick={closeMobileMenu}>
                  <a className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <span className="font-bold">EduAble</span>
                  </a>
                </Link>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-4 py-4">
                <Link href="/" onClick={closeMobileMenu}>
                  <a className={`px-2 py-1 text-base transition-colors hover:text-primary ${isActive('/') ? 'text-primary font-medium' : 'text-foreground/60'}`}>
                    Home
                  </a>
                </Link>
                <Link href="/courses" onClick={closeMobileMenu}>
                  <a className={`px-2 py-1 text-base transition-colors hover:text-primary ${isActive('/courses') ? 'text-primary font-medium' : 'text-foreground/60'}`}>
                    Courses
                  </a>
                </Link>
                <a 
                  href="#about" 
                  className="px-2 py-1 text-base text-foreground/60 transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  About
                </a>
                <a 
                  href="#testimonials" 
                  className="px-2 py-1 text-base text-foreground/60 transition-colors hover:text-primary"
                  onClick={closeMobileMenu}
                >
                  Testimonials
                </a>
              </nav>
              <div className="mt-auto py-4 border-t flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href={getDashboardLink()} onClick={closeMobileMenu}>
                      <Button className="w-full" variant="default">Dashboard</Button>
                    </Link>
                    <Button 
                      className="w-full"
                      variant="outline" 
                      onClick={() => {
                        logoutMutation.mutate();
                        closeMobileMenu();
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={closeMobileMenu}>
                      <Button className="w-full" variant="outline">Log in</Button>
                    </Link>
                    <Link href="/auth?tab=register" onClick={closeMobileMenu}>
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
