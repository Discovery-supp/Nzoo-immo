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
    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔄 [AUTO-CANCEL] Début de la vérification des réservations en cash...')

    // Date limite : 5 jours avant maintenant
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    
    console.log('📅 [AUTO-CANCEL] Date limite:', fiveDaysAgo.toISOString())

    // Récupérer toutes les réservations en cash en attente depuis plus de 5 jours
    const { data: pendingCashReservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('payment_method', 'cash')
      .eq('status', 'pending')
      .lt('created_at', fiveDaysAgo.toISOString())

    if (fetchError) {
      console.error('❌ [AUTO-CANCEL] Erreur lors de la récupération des réservations:', fetchError)
      throw fetchError
    }

    console.log(`📊 [AUTO-CANCEL] ${pendingCashReservations?.length || 0} réservations en cash en attente depuis plus de 5 jours`)

    if (!pendingCashReservations || pendingCashReservations.length === 0) {
      console.log('✅ [AUTO-CANCEL] Aucune réservation à annuler')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Aucune réservation à annuler',
          cancelledCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Annuler toutes ces réservations
    const cancelledReservations = []
    const errors = []

    for (const reservation of pendingCashReservations) {
      try {
        console.log(`🔄 [AUTO-CANCEL] Annulation de la réservation ${reservation.transaction_id}...`)

        // Mettre à jour le statut de la réservation
        const { error: updateError } = await supabase
          .from('reservations')
          .update({ 
            status: 'cancelled',
            admin_notes: `Annulation automatique : Paiement non régularisé après 5 jours (${new Date().toISOString()})`,
            updated_at: new Date().toISOString()
          })
          .eq('id', reservation.id)

        if (updateError) {
          console.error(`❌ [AUTO-CANCEL] Erreur lors de l'annulation de ${reservation.transaction_id}:`, updateError)
          errors.push({ reservation_id: reservation.id, error: updateError.message })
          continue
        }

        // Mettre à jour les statistiques du client si client_id existe
        if (reservation.client_id) {
          try {
            await supabase.rpc('update_client_stats', { client_uuid: reservation.client_id })
            console.log(`✅ [AUTO-CANCEL] Statistiques client mises à jour pour ${reservation.transaction_id}`)
          } catch (statsError) {
            console.warn(`⚠️ [AUTO-CANCEL] Erreur mise à jour stats client pour ${reservation.transaction_id}:`, statsError)
          }
        }

        cancelledReservations.push(reservation)
        console.log(`✅ [AUTO-CANCEL] Réservation ${reservation.transaction_id} annulée avec succès`)

      } catch (error) {
        console.error(`❌ [AUTO-CANCEL] Erreur lors du traitement de ${reservation.transaction_id}:`, error)
        errors.push({ reservation_id: reservation.id, error: error.message })
      }
    }

    // Envoyer un email de notification d'annulation automatique pour chaque réservation annulée
    for (const reservation of cancelledReservations) {
      try {
        await sendAutoCancellationEmail(supabase, reservation)
      } catch (emailError) {
        console.warn(`⚠️ [AUTO-CANCEL] Erreur envoi email annulation pour ${reservation.transaction_id}:`, emailError)
      }
    }

    console.log(`✅ [AUTO-CANCEL] Traitement terminé. ${cancelledReservations.length} réservations annulées, ${errors.length} erreurs`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Traitement terminé avec succès`,
        cancelledCount: cancelledReservations.length,
        errorCount: errors.length,
        cancelledReservations: cancelledReservations.map(r => ({
          id: r.id,
          transaction_id: r.transaction_id,
          email: r.email,
          full_name: r.full_name
        })),
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [AUTO-CANCEL] Erreur générale:', error)
    
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

// Fonction pour envoyer l'email d'annulation automatique
async function sendAutoCancellationEmail(supabase: any, reservation: any) {
  try {
    const emailContent = `
      <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
          <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 10px; font-family: Arial, sans-serif; font-weight: 700;">
            Réservation Annulée Automatiquement
          </h1>
          <p style="color: #183154; font-size: 16px; font-family: Arial, sans-serif;">
            Votre réservation a été annulée pour non-paiement
          </p>
      </div>
      
      <div style="margin-bottom: 20px;">
          <p style="color: #183154; font-size: 16px; font-family: Arial, sans-serif;">
            Bonjour <strong>${reservation.full_name}</strong>,
          </p>
      </div>
      
      <div style="margin-bottom: 30px;">
          <p style="color: #183154; font-size: 16px; font-family: Arial, sans-serif; line-height: 1.6;">
            Nous vous informons que votre réservation a été <strong>automatiquement annulée</strong> 
            car le paiement n'a pas été régularisé dans les 5 jours suivant la création de la réservation.
          </p>
      </div>
      
      <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <div style="text-align: center; margin-bottom: 15px;">
              <div style="color: #dc2626; font-size: 18px; font-family: Arial, sans-serif; font-weight: 600;">
                  📋 Détails de la réservation annulée
              </div>
          </div>
          <div style="color: #dc2626; font-size: 14px; font-family: Arial, sans-serif; line-height: 1.6;">
              <p><strong>Référence :</strong> ${reservation.transaction_id}</p>
              <p><strong>Espace :</strong> ${reservation.space_type}</p>
              <p><strong>Dates :</strong> ${reservation.start_date} à ${reservation.end_date}</p>
              <p><strong>Montant :</strong> $${reservation.amount}</p>
              <p><strong>Méthode de paiement :</strong> ${reservation.payment_method}</p>
          </div>
      </div>
      
      <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <div style="text-align: center; margin-bottom: 15px;">
              <div style="color: #1e40af; font-size: 18px; font-family: Arial, sans-serif; font-weight: 600;">
                  🔄 Comment procéder ?
              </div>
          </div>
          <div style="color: #1e40af; font-size: 14px; font-family: Arial, sans-serif; line-height: 1.6;">
              <p>Si vous souhaitez toujours réserver cet espace :</p>
              <ol style="text-align: left; margin-left: 20px;">
                  <li>Effectuez le paiement en espèces au bureau</li>
                  <li>Créez une nouvelle réservation</li>
                  <li>Votre réservation sera confirmée immédiatement</li>
              </ol>
          </div>
      </div>
      
      <div style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <div style="text-align: center; margin-bottom: 15px;">
              <div style="color: #1e40af; font-size: 18px; font-family: Arial, sans-serif; font-weight: 600;">
                  📍 Adresse du Bureau
              </div>
          </div>
          <div style="color: #1e40af; font-size: 16px; font-family: Arial, sans-serif; text-align: center; line-height: 1.6;">
              16, colonel Lukusa, Commune de la Gombe<br>
              Kinshasa, République Démocratique du Congo
          </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
          <p style="color: #183154; font-size: 14px; font-family: Arial, sans-serif;">
              Nous nous excusons pour ce désagrément. Notre équipe reste à votre disposition pour toute question.
          </p>
      </div>
    `

    // Envoyer l'email via la fonction send-confirmation-email
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        to: reservation.email,
        subject: `❌ Réservation annulée automatiquement - ${reservation.transaction_id}`,
        html: emailContent,
        reservationData: reservation
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`)
    }

    console.log(`✅ [AUTO-CANCEL] Email d'annulation envoyé à ${reservation.email}`)

  } catch (error) {
    console.error(`❌ [AUTO-CANCEL] Erreur envoi email annulation pour ${reservation.email}:`, error)
    throw error
  }
}
