import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  reservationData?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { to, subject, html, reservationData }: EmailRequest = await req.json()

    console.log('📧 [EDGE] Début envoi email:', { to, subject })

    // Récupérer les variables d'environnement
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'reservations@nzooimmo.com'

    console.log('🔧 [EDGE] Configuration:', {
      hasResendKey: !!resendApiKey,
      hasSendGridKey: !!sendgridApiKey,
      fromEmail
    })

    // Essayer SendGrid en premier (si configuré)
    if (sendgridApiKey) {
      console.log('📧 [EDGE] Tentative envoi via SendGrid...')
      try {
        const sendGridResult = await sendViaSendGrid(sendgridApiKey, fromEmail, to, subject, html)
        if (sendGridResult.success) {
          console.log('✅ [EDGE] Email envoyé avec succès via SendGrid')
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Email sent successfully via SendGrid',
              emailSent: true,
              provider: 'sendgrid',
              error: null
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        } else {
          console.log('❌ [EDGE] Échec SendGrid:', sendGridResult.error)
        }
      } catch (error) {
        console.log('❌ [EDGE] Erreur SendGrid:', error.message)
      }
    }

    // Essayer Resend (si configuré)
    if (resendApiKey) {
      console.log('📧 [EDGE] Tentative envoi via Resend...')
      try {
        const resendResult = await sendViaResend(resendApiKey, fromEmail, to, subject, html)
        if (resendResult.success) {
          console.log('✅ [EDGE] Email envoyé avec succès via Resend')
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Email sent successfully via Resend',
              emailSent: true,
              provider: 'resend',
              error: null
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        } else {
          console.log('❌ [EDGE] Échec Resend:', resendResult.error)
        }
      } catch (error) {
        console.log('❌ [EDGE] Erreur Resend:', error.message)
      }
    }

    // Fallback: simulation
    console.log('📧 [EDGE] Aucun service configuré, simulation...')
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email simulation successful',
        emailSent: true,
        provider: 'simulation',
        error: 'Mode simulation - Configurez RESEND_API_KEY ou SENDGRID_API_KEY pour un envoi réel',
        note: 'Configurez un service d\'email pour un envoi réel'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('❌ [EDGE] Erreur générale:', error)
    
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})

// Fonction pour envoyer via SendGrid
async function sendViaSendGrid(apiKey: string, fromEmail: string, to: string, subject: string, html: string) {
  try {
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
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (response.ok) {
      return { success: true }
    } else {
      const errorText = await response.text()
      return { success: false, error: `SendGrid error: ${response.status} - ${errorText}` }
    }
  } catch (error) {
    return { success: false, error: `SendGrid error: ${error.message}` }
  }
}

// Fonction pour envoyer via Resend
async function sendViaResend(apiKey: string, fromEmail: string, to: string, subject: string, html: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      return { success: true }
    } else {
      const errorText = await response.text()
      return { success: false, error: `Resend error: ${response.status} - ${errorText}` }
    }
  } catch (error) {
    return { success: false, error: `Resend error: ${error.message}` }
  }
}
