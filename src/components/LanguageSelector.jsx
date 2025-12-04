import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronUp } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
            >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="hidden md:inline">{currentLang.name}</span>
                <ChevronUp
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden py-1 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--color-bg-secondary)] transition-colors ${language === lang.code ? 'bg-[var(--color-bg-secondary)]' : ''
                                }`}
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
