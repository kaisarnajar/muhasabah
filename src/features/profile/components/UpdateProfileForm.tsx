'use client';

import { useState, useEffect } from 'react';
import { updateProfile } from '@/features/auth/actions';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface UpdateProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export default function UpdateProfileForm({ initialName, initialEmail }: UpdateProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(result.success);
      setIsEditing(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <span className="text-label-sm text-on-surface-variant">FULL NAME</span>
        <div className="text-body-lg" style={{ marginTop: '4px' }}>{name}</div>
      </div>
      <div>
        <span className="text-label-sm text-on-surface-variant">EMAIL ADDRESS</span>
        <div className="text-body-lg" style={{ marginTop: '4px' }}>{email}</div>
      </div>
      <button 
        onClick={() => setIsEditing(true)} 
        className="primary-btn" 
        style={{ padding: '10px 20px', borderRadius: '8px', width: 'fit-content', marginTop: '8px' }}
      >
        Edit Profile Details
      </button>

      {isEditing && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            setIsEditing(false);
            setName(initialName);
            setEmail(initialEmail);
            setError('');
            setSuccess('');
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="text-title-lg" style={{ margin: 0, fontWeight: 700 }}>Edit Profile Details</h3>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setName(initialName);
                  setEmail(initialEmail);
                  setError('');
                  setSuccess('');
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', paddingLeft: '16px', borderRadius: '8px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', paddingLeft: '16px', borderRadius: '8px' }}
                  required
                />
              </div>

              {error && <p className="text-label-sm" style={{ color: 'var(--c-error)', margin: 0 }}>{error}</p>}
              {success && <p className="text-label-sm" style={{ color: 'var(--c-primary)', margin: 0 }}>{success}</p>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setName(initialName);
                    setEmail(initialEmail);
                    setError('');
                    setSuccess('');
                  }} 
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
