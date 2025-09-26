import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return null
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

  return user[0] || null
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    redirect('/zh/unauthorized')
  }
  return true
} 