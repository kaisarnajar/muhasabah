import { getAuthenticatedUser } from '@/features/auth/actions';
import { User, Mail, LogOut } from 'lucide-react';
import ChangePasswordForm from "@/features/profile/components/ChangePasswordForm";
import UpdateProfileForm from "@/features/profile/components/UpdateProfileForm";

export default async function Profile() {
  const user = await getAuthenticatedUser();
  if (!user) return null; // Middleware will handle redirect

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <User color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>User Profile</h2>
      </div>

      <div className="grid-container">
        <div className="card col-span-8" style={{ padding: '24px' }}>
          <h2 className="text-title-lg" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-primary)' }}>
            <User size={24} />
            Personal Details
          </h2>
          
          <UpdateProfileForm initialName={user.name} initialEmail={user.email} />

          <div style={{ marginTop: '24px' }}>
            <span className="text-label-sm text-on-surface-variant">MEMBER SINCE</span>
            <div className="text-body-lg" style={{ marginTop: '4px' }}>
              {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="card col-span-4" style={{ padding: '24px' }}>
          <h2 className="text-title-lg" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-primary)' }}>
            <Mail size={24} />
            Security Settings
          </h2>
          
          <p className="text-body-md text-on-surface-variant" style={{ marginBottom: '16px' }}>
            To change your password, input your current password and your new password.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
