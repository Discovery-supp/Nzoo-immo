const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { to, subject, html } = await req.json()

    console.log('📧 Simple email test - To:', to)
    console.log('📧 Subject:', subject)

    // Simulation simple
    const emailSent = true
    const provider = 'simulation'

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email test successful',
        emailSent: emailSent,
        provider: provider,
        note: 'Mode simulation - Configurez un service d\'email réel'
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('❌ Error in simple email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erreur: ${error.message}`,
        emailSent: false,
        provider: 'none'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})




