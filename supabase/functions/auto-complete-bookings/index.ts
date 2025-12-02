import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time in HH:MM format
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)

    // Find all confirmed bookings where the end time has passed
    const { data: bookingsToComplete, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_date, end_time')
      .eq('status', 'confirmed')
      .or(`booking_date.lt.${currentDate},and(booking_date.eq.${currentDate},end_time.lte.${currentTime})`)

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError)
      throw fetchError
    }

    if (!bookingsToComplete || bookingsToComplete.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bookings to complete', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update all matching bookings to completed
    const bookingIds = bookingsToComplete.map(b => b.id)
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .in('id', bookingIds)

    if (updateError) {
      console.error('Error updating bookings:', updateError)
      throw updateError
    }

    console.log(`Auto-completed ${bookingIds.length} bookings`)

    return new Response(
      JSON.stringify({ 
        message: 'Bookings auto-completed successfully', 
        count: bookingIds.length,
        bookingIds 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error in auto-complete-bookings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
