import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect users to the dashboard page
  redirect('/dashboard');
}