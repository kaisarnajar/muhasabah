'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/auth';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
      
      // If email didn't change, we just refresh the server component to get new name/email
      if (!result.emailChanged) {
        router.refresh();
      }
    }
    setLoading(false);
  };

  if (!isEditing) {
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
          className="secondary-btn" 
          style={{ padding: '8px 16px', width: 'fit-content', marginTop: '8px' }}
        >
          Edit Profile Details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', width: '100%' }}>
      <div>
        <label className="text-label-sm text-on-surface-variant" style={{ display: 'block', marginBottom: '4px' }}>
          FULL NAME
        </label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="search-input"
          style={{ width: '100%', paddingLeft: '16px' }}
          required
        />
      </div>

      <div>
        <label className="text-label-sm text-on-surface-variant" style={{ display: 'block', marginBottom: '4px' }}>
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="search-input"
          style={{ width: '100%', paddingLeft: '16px' }}
          required
        />
      </div>

      {error && <p className="text-label-sm" style={{ color: 'var(--c-error)', margin: 0 }}>{error}</p>}
      {success && <p className="text-label-sm" style={{ color: 'var(--c-primary)', margin: 0 }}>{success}</p>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="submit" className="primary-btn" style={{ padding: '8px 16px' }} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            setIsEditing(false);
            setName(initialName);
            setEmail(initialEmail);
            setError('');
            setSuccess('');
          }} 
          className="secondary-btn" 
          style={{ padding: '8px 16px' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
