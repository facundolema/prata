import Image from 'next/image'
import MessageDashboard from '@/components/MessageDashboard'
export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold">Prata</h1>
      <MessageDashboard />
    </main>
  )
}
