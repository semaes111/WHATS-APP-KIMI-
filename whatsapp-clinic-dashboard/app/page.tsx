import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      redirect('/dashboard');
    }
  }

  redirect('/login');
}
