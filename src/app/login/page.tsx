'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { loginAction } from '@/actions';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <Lock size={32} color="var(--primary-color)" />
          </div>
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Personal Access</h2>
        <p className="text-secondary" style={{ marginBottom: '2rem' }}>Enter your app password to continue to My Muhasabah</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="App Password"
            autoFocus
            required
          />
          {error && <p style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
