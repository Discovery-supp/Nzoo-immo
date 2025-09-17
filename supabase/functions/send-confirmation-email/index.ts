import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer les requêtes CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Récupérer les données de la requête
    const { to, subject, html, reservationData } = await req.json()

    console.log('📧 [EDGE] Envoi email:', {
      to,
      subject,
      hasHtml: !!html,
      hasReservationData: !!reservationData
    })

    // Validation des données
    if (!to || !subject || !html) {
      throw new Error('Données manquantes: to, subject, et html sont requis')
    }

    // Configuration Supabase (utiliser les variables d'environnement)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Enregistrer l'email dans la base de données pour le suivi
    try {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          to_email: to,
          subject: subject,
          html_content: html,
          reservation_data: reservationData,
          status: 'sent',
          sent_at: new Date().toISOString()
        })

      if (logError) {
        console.warn('⚠️ [EDGE] Erreur lors de l\'enregistrement du log email:', logError)
        // Ne pas faire échouer l'envoi si le log échoue
      }
    } catch (logError) {
      console.warn('⚠️ [EDGE] Impossible d\'enregistrer le log email:', logError)
    }

    // Ici, vous pouvez intégrer votre service d'envoi d'emails préféré
    // Par exemple: SendGrid, Resend, ou un service SMTP
    
    // Pour l'instant, on simule l'envoi d'email
    console.log('📧 [EDGE] Email simulé envoyé avec succès à:', to)
    console.log('📧 [EDGE] Sujet:', subject)
    console.log('📧 [EDGE] Contenu HTML disponible:', html.length, 'caractères')

    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 100))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email envoyé avec succès (mode simulation)',
        to: to,
        subject: subject,
        timestamp: new Date().toISOString(),
        note: 'Mode simulation activé - aucun email réel n\'a été envoyé'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [EDGE] Erreur lors de l\'envoi d\'email:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
