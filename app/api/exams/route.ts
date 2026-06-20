import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exams: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch exams'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
