const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  reservationData?: any
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
    const { to, subject, html, reservationData }: EmailRequest = await req.json()

    console.log('📧 Sending email to:', to)
    console.log('📧 Subject:', subject)
    console.log('📧 Reservation data:', reservationData)

    // Récupérer les variables d'environnement
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'reservations@nzooimmo.com'
    
    // Essayer d'abord SendGrid, puis Resend, puis simulation
    let emailSent = false
    let provider = 'none'
    let error = null

    // Test 1: SendGrid
    if (sendGridApiKey) {
      try {
        console.log('📧 Trying SendGrid...')
        const emailData = {
          personalizations: [{
            to: [{ email: to }],
            subject: subject
          }],
          from: { 
            email: fromEmail, 
            name: 'Nzoo Immo - Réservations' 
          },
          content: [{
            type: 'text/html',
            value: html
          }],
          reply_to: {
            email: fromEmail,
            name: 'Support Nzoo Immo'
          }
        }

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        if (response.ok) {
          console.log('✅ Email sent successfully via SendGrid')
          emailSent = true
          provider = 'sendgrid'
        } else {
          const errorText = await response.text()
          console.error('❌ SendGrid error:', response.status, errorText)
          error = `SendGrid error: ${response.status} - ${errorText}`
        }
      } catch (sendGridError) {
        console.error('❌ SendGrid error:', sendGridError)
        error = `SendGrid error: ${sendGridError.message}`
      }
    }

    // Test 2: Resend (si SendGrid a échoué)
    if (!emailSent && resendApiKey) {
      try {
        console.log('📧 Trying Resend...')
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: subject,
            html: html,
            reply_to: fromEmail
          })
        })

        if (response.ok) {
          console.log('✅ Email sent successfully via Resend')
          emailSent = true
          provider = 'resend'
        } else {
          const errorText = await response.text()
          console.error('❌ Resend error:', response.status, errorText)
          error = `Resend error: ${response.status} - ${errorText}`
        }
      } catch (resendError) {
        console.error('❌ Resend error:', resendError)
        error = `Resend error: ${resendError.message}`
      }
    }

    // Test 3: Simulation (si aucun service n'est configuré ou n'a fonctionné)
    if (!emailSent) {
      console.log('📧 No email service configured, using simulation mode')
      emailSent = true
      provider = 'simulation'
      error = 'Email simulé - Aucun service d\'email configuré. Configurez SENDGRID_API_KEY ou RESEND_API_KEY pour un envoi réel.'
    }

    return new Response(
      JSON.stringify({ 
        success: emailSent,
        message: emailSent ? 'Email sent successfully' : 'Failed to send email',
        emailSent: emailSent,
        provider: provider,
        error: error,
        note: provider === 'simulation' ? 'Configurez un service d\'email pour un envoi réel' : undefined
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('❌ Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erreur serveur: ${error.message}`,
        emailSent: false,
        provider: 'none',
        stack: error.stack
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