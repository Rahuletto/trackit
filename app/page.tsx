import { Metadata } from 'next'
import Dashboard from '@/components/dashboard'

export const metadata: Metadata = {
  title: 'Trackit - Health Tracker',
  description: 'Track your daily health habits and get personalized tips.',
}

export default function Page() {
  return <Dashboard />
}

