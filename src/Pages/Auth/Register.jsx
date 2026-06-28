import { Link } from 'react-router-dom';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
  return (
    <GuestLayout title="Registration closed" subtitle="Staff accounts are managed by administrators">
      <div className="alert alert-warning">
        Public registration is disabled. An Administrator must create your account from the Admin → Staff Management panel.
      </div>
      <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: '1rem', display: 'flex' }}>
        Back to sign in
      </Link>
    </GuestLayout>
  );
}
