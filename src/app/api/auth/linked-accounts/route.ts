import { getLinkedAccountsAction } from '@/lib/actions'
import { NextResponse } from 'next/server'

export async function GET() {
  const accounts = await getLinkedAccountsAction()
  return NextResponse.json(accounts)
}
