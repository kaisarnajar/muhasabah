import { getAuthenticatedUser } from '@/actions/auth';
import { User, Mail, ShieldCheck, LogOut } from 'lucide-react';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import UpdateProfileForm from '@/components/profile/UpdateProfileForm';

export default async function Profile() {
  const user = await getAuthenticatedUser();
  if (!user) return null; // Middleware will handle redirect

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="text-display-sm" style={{ marginBottom: '8px' }}>Your Profile</h1>
        <p className="text-body-lg text-on-surface-variant">Manage your account settings and preferences.</p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 className="text-title-lg" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} color="var(--c-primary)" />
          Personal Details
        </h2>
        
        <UpdateProfileForm initialName={user.name} initialEmail={user.email} />
        
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
          <span className="text-label-sm text-on-surface-variant">EMAIL STATUS</span>
          <div className="text-body-lg" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.emailVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-primary)' }}>
                <ShieldCheck size={18} /> Verified
              </span>
            ) : (
              <span style={{ color: 'var(--c-error)' }}>Unverified</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <span className="text-label-sm text-on-surface-variant">MEMBER SINCE</span>
          <div className="text-body-lg" style={{ marginTop: '4px' }}>
            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 className="text-title-lg" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={24} color="var(--c-primary)" />
          Security
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="text-body-md text-on-surface-variant">
            To change your password, input your current password and your new password.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
