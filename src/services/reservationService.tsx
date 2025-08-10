@@ .. @@
       if (result.success) {
         console.log(`✅ Reservation created successfully:`, result);
         setReservationSuccess(true);
-        setEmailSent(result.emailSent || false);
         setCurrentStep(4);
-        
-        // Afficher une notification si l'email n'a pas été envoyé
-        if (!result.emailSent) {
-          console.warn('⚠️ Email de confirmation non envoyé pour la réservation:', result.reservation?.id);
-        }
       } else {
         throw new Error(result.error || 'Échec de la création de la réservation');
       }
@@ .. @@
       if (result.success) {
         console.log(`✅ Reservation created successfully:`, result);
         setReservationSuccess(true);
-        setEmailSent(result.emailSent || false);
         setCurrentStep(4);
-        
-        // Afficher une notification si l'email n'a pas été envoyé
-        if (!result.emailSent) {
-          console.warn('⚠️ Email de confirmation non envoyé pour la réservation:', result.reservation?.id);
-        }
       } else {
         throw new Error(result.error || 'Échec de la création de la réservation');
       }