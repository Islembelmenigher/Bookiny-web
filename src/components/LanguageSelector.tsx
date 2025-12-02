import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
}

export function LanguageSelector({ variant = 'default' }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const currentLang = getCurrentLanguage();

  const handleLanguageChange = async (langCode: string) => {
    changeLanguage(langCode);

    // If user is logged in, save preference to database
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ language_preference: langCode })
          .eq('id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === 'minimal' ? 'icon' : 'default'} className="gap-2">
          <Globe className="h-4 w-4" />
          {variant === 'default' && <span>{currentLanguage.nativeName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={currentLang === lang.code ? 'bg-accent' : ''}
          >
            <span className={lang.code === 'ar' ? 'font-arabic' : ''}>
              {lang.nativeName}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
