'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  isClientSide?: boolean;
}

export default function SearchInput({ 
  placeholder = "Search...", 
  value, 
  onChange,
  isClientSide = false 
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    if (isClientSide && onChange) {
      onChange(term);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '14px', 
        transform: 'translateY(-50%)', 
        display: 'flex', 
        alignItems: 'center', 
        pointerEvents: 'none', 
        color: 'var(--c-on-surface-variant)',
        opacity: isPending ? 0.5 : 1
      }}>
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        defaultValue={isClientSide ? undefined : (searchParams.get('search') || '')}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
        style={{ 
          width: '100%', 
          paddingLeft: '42px', 
          borderRadius: '8px',
          opacity: isPending ? 0.8 : 1
        }}
      />
    </div>
  );
}
