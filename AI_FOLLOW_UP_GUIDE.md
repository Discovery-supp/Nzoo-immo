# 🤖 Système de Relances Intelligentes IA - N'zoo Immo

## 🎯 Vue d'ensemble

Le système de relances intelligentes IA analyse automatiquement le comportement des clients et génère des relances personnalisées pour optimiser la rétention et l'engagement.

## ✨ Fonctionnalités Principales

### 🧠 **Analyse IA des Clients**
- **Score de risque** : Évalue la probabilité qu'un client quitte (0-100)
- **Score d'engagement** : Mesure l'activité et la fidélité du client (0-100)
- **Valeur vie** : Calcule la valeur totale du client
- **Préférences** : Identifie les canaux et moments de contact préférés
- **Intérêts** : Analyse les types d'espaces et activités préférés

### 📧 **Stratégies de Relance Automatisées**
- **Bienvenue Nouveau Client** : Accueil personnalisé pour les nouveaux clients
- **Rappel Client Inactif** : Relance pour les clients inactifs depuis 30+ jours
- **Rétention Client VIP** : Service premium pour les clients à forte valeur
- **Suivi Annulation** : Relance empathique après annulation
- **Promotion Saisonnière** : Offres spéciales selon la période

### 🔄 **Mode Automatique**
- **Génération automatique** : Analyse quotidienne des clients
- **Envoi programmé** : Relances envoyées aux moments optimaux
- **Multi-canal** : Email, SMS, et notifications push
- **Personnalisation** : Messages adaptés au profil client

## 🛠️ Installation et Configuration

### 1. **Migration de Base de Données**

Exécutez la migration SQL dans Supabase :

```sql
-- Exécuter le fichier de migration
-- supabase/migrations/20250115000000_ai_follow_ups.sql
```

### 2. **Configuration des Variables d'Environnement**

Ajoutez ces variables dans votre `.env.local` :

```env
# Configuration IA
VITE_AI_FOLLOW_UP_ENABLED=true
VITE_AI_AUTO_MODE_ENABLED=false
VITE_AI_CHECK_INTERVAL_MINUTES=60
VITE_AI_DAILY_LIMIT=50

# Seuils IA
VITE_AI_HIGH_RISK_THRESHOLD=70
VITE_AI_LOW_ENGAGEMENT_THRESHOLD=40
VITE_AI_CRITICAL_INACTIVITY_DAYS=30
```

### 3. **Intégration dans l'Application**

Le système est déjà intégré dans l'application :

- **Route** : `/ai-follow-ups`
- **Accès** : Administrateurs uniquement
- **Navigation** : Menu Administration → Relances IA

## 📊 Interface Utilisateur

### **Onglet Vue d'ensemble**
- Statistiques en temps réel
- Nombre total de clients
- Clients à risque élevé
- Clients à faible engagement
- Relances en attente
- Relances envoyées aujourd'hui

### **Onglet Analyse Clients**
- Liste de tous les clients avec leurs scores
- Scores de risque et d'engagement
- Valeur vie et dernière activité
- Date de prochaine relance recommandée
- Actions rapides pour générer des relances

### **Onglet Relances**
- Liste de toutes les relances générées
- Statut (en attente, envoyée, échouée)
- Priorité et canal de communication
- Date programmée et confiance IA
- Actions pour envoyer ou modifier

### **Onglet Stratégies**
- Configuration des stratégies de relance
- Conditions de déclenchement
- Prompts IA personnalisables
- Canaux de communication
- Périodes de refroidissement

### **Onglet Paramètres**
- Seuils de risque et d'engagement
- Fréquence des vérifications
- Limites quotidiennes
- Mode automatique

## 🧮 Algorithmes IA

### **Calcul du Score de Risque**
```typescript
// Facteurs pris en compte :
// 1. Temps depuis la dernière activité
if (daysSinceLast > 90) score += 40;
else if (daysSinceLast > 60) score += 30;
else if (daysSinceLast > 30) score += 20;
else if (daysSinceLast > 14) score += 10;

// 2. Valeur du client
if (totalSpent > 1000) score += 30;
else if (totalSpent > 500) score += 20;
else if (totalSpent > 100) score += 10;

// 3. Historique des annulations
score += cancellations * 5;
```

### **Calcul du Score d'Engagement**
```typescript
// Score de base : 100
let engagementScore = 100;

// Réduction selon l'inactivité
if (daysSinceLast > 90) engagementScore -= 60;
else if (daysSinceLast > 60) engagementScore -= 40;
else if (daysSinceLast > 30) engagementScore -= 20;
else if (daysSinceLast > 14) engagementScore -= 10;

// Augmentation selon la fréquence
const frequency = reservations.length / Math.max(daysSinceLast / 30, 1);
engagementScore += Math.min(frequency * 10, 30);
```

### **Recommandation de Stratégie**
```typescript
function recommendStrategy(riskScore, engagementScore, daysSinceLast, totalSpent) {
  if (totalSpent > 500 && daysSinceLast > 14) {
    return 'high_value_client_retention';
  } else if (daysSinceLast > 30) {
    return 'inactive_client_reminder';
  } else if (daysSinceLast < 7) {
    return 'welcome_new_client';
  } else {
    return 'seasonal_promotion';
  }
}
```

## 📧 Génération de Contenu IA

### **Prompts IA par Stratégie**

#### **Bienvenue Nouveau Client**
```
Génère un message de bienvenue chaleureux et personnalisé pour un nouveau client 
qui vient de faire sa première réservation. Inclus des informations utiles sur 
les services et encourage l'engagement.
```

#### **Rappel Client Inactif**
```
Génère un message de relance amical pour un client qui n'a pas réservé depuis 
plus de 30 jours. Rappelle les avantages de nos services et propose une offre 
spéciale pour le faire revenir.
```

#### **Rétention Client VIP**
```
Génère un message VIP pour un client à forte valeur qui n'a pas réservé récemment. 
Offre un service premium personnalisé et montre que nous apprécions leur fidélité.
```

### **Personnalisation du Contenu**
- **Nom du client** : Utilisation du nom dans le message
- **Historique** : Référence aux réservations précédentes
- **Préférences** : Mention des types d'espaces préférés
- **Offres spéciales** : Réductions personnalisées selon la valeur
- **Ton** : Adapté au score de risque et d'engagement

## 🔄 Flux de Travail Automatique

### **1. Analyse Quotidienne**
```typescript
// Toutes les heures (configurable)
setInterval(async () => {
  if (autoModeEnabled) {
    const newFollowUps = await aiFollowUpService.generateAutomaticFollowUps();
    console.log(`${newFollowUps.length} relances générées`);
  }
}, checkIntervalMinutes * 60 * 1000);
```

### **2. Génération de Relances**
```typescript
// Pour chaque client
const insight = await analyzeClient(clientId);
if (shouldSendFollowUp(insight)) {
  const strategy = recommendStrategy(insight);
  const followUp = await generateFollowUp(clientId, strategy);
  await saveFollowUp(followUp);
}
```

### **3. Envoi Programmé**
```typescript
// Vérification quotidienne des relances à envoyer
const pendingFollowUps = await getPendingFollowUps();
for (const followUp of pendingFollowUps) {
  if (followUp.scheduledDate <= new Date()) {
    await sendFollowUp(followUp.id);
  }
}
```

## 📊 Métriques et Analytics

### **KPIs Principaux**
- **Taux de rétention** : % de clients qui reviennent après relance
- **Taux d'ouverture** : % d'emails ouverts
- **Taux de clic** : % de liens cliqués
- **Taux de conversion** : % de relances qui génèrent une réservation
- **ROI** : Retour sur investissement des relances

### **Tableau de Bord**
```sql
-- Vue des statistiques
SELECT 
  COUNT(*) as total_follow_ups,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_follow_ups,
  AVG(ai_confidence) as avg_confidence,
  COUNT(DISTINCT client_id) as unique_clients
FROM ai_follow_ups;
```

## 🔧 Configuration Avancée

### **Personnalisation des Seuils**
```typescript
// Dans les paramètres IA
const settings = {
  highRiskThreshold: 70,        // Seuil de risque élevé
  lowEngagementThreshold: 40,   // Seuil d'engagement faible
  criticalInactivityDays: 30,   // Jours d'inactivité critique
  checkIntervalMinutes: 60,     // Intervalle de vérification
  dailyFollowUpLimit: 50        // Limite quotidienne
};
```

### **Ajout de Nouvelles Stratégies**
```typescript
// Dans aiFollowUpService.ts
const newStrategy: FollowUpStrategy = {
  id: 'custom_strategy',
  name: 'Ma Stratégie Personnalisée',
  description: 'Description de la stratégie',
  triggerConditions: [
    { type: 'total_spent', operator: 'greater_than', value: 1000 }
  ],
  aiPrompt: 'Prompt personnalisé pour l\'IA',
  priority: 'high',
  channels: ['email', 'sms'],
  cooldownDays: 14
};
```

## 🚀 Optimisation et Performance

### **Optimisations Base de Données**
- **Index** : Sur client_id, status, scheduled_date
- **Partitioning** : Par date pour les grandes tables
- **Archivage** : Relances anciennes automatiquement archivées
- **Cache** : Mise en cache des insights clients

### **Optimisations IA**
- **Batch Processing** : Traitement par lots des clients
- **Async Processing** : Génération asynchrone des relances
- **Rate Limiting** : Limitation des appels API IA
- **Fallback** : Contenu de secours en cas d'échec IA

## 🔒 Sécurité et Conformité

### **Protection des Données**
- **Chiffrement** : Données sensibles chiffrées
- **Anonymisation** : Données anonymisées pour l'analyse
- **Consentement** : Respect du consentement client
- **RGPD** : Conformité avec le RGPD

### **Contrôles d'Accès**
- **Authentification** : Accès administrateur requis
- **Autorisation** : Permissions granulaires
- **Audit** : Logs de toutes les actions
- **Backup** : Sauvegarde régulière des données

## 🧪 Tests et Validation

### **Tests Automatisés**
```typescript
// Tests des algorithmes IA
describe('AI Follow-up Service', () => {
  test('should calculate risk score correctly', () => {
    const insight = await analyzeClient('test@example.com');
    expect(insight.riskScore).toBeGreaterThanOrEqual(0);
    expect(insight.riskScore).toBeLessThanOrEqual(100);
  });

  test('should generate appropriate follow-up', () => {
    const followUp = await generateFollowUp('test@example.com', 'welcome_new_client');
    expect(followUp.subject).toBeTruthy();
    expect(followUp.message).toBeTruthy();
  });
});
```

### **Validation des Résultats**
- **A/B Testing** : Test de différentes stratégies
- **Validation manuelle** : Revue des relances générées
- **Feedback loop** : Amélioration basée sur les résultats
- **Monitoring** : Surveillance continue des performances

## 📈 Évolutions Futures

### **Intégrations Avancées**
- **API IA externe** : Intégration OpenAI, Claude, etc.
- **CRM** : Synchronisation avec systèmes CRM
- **Analytics** : Intégration Google Analytics, Mixpanel
- **Marketing Automation** : HubSpot, Mailchimp

### **Fonctionnalités Avancées**
- **Prédiction de churn** : Modèles ML avancés
- **Optimisation automatique** : A/B testing automatique
- **Personnalisation temps réel** : Adaptation en temps réel
- **Multilingue** : Support de plusieurs langues

## 🆘 Dépannage

### **Problèmes Courants**

#### **Relances non générées**
```bash
# Vérifier les logs
tail -f logs/ai-follow-up.log

# Vérifier la configuration
curl -X GET "https://your-project.supabase.co/rest/v1/ai_follow_up_settings"
```

#### **Erreurs d'envoi**
```bash
# Vérifier les services d'email/SMS
# Vérifier les quotas et limites
# Vérifier la configuration des canaux
```

#### **Performance lente**
```bash
# Optimiser les requêtes
EXPLAIN ANALYZE SELECT * FROM ai_follow_ups WHERE status = 'pending';

# Vérifier les index
SELECT schemaname, tablename, indexname FROM pg_indexes WHERE tablename = 'ai_follow_ups';
```

### **Support**
- **Documentation** : Ce guide et la documentation API
- **Logs** : Logs détaillés dans la base de données
- **Monitoring** : Tableau de bord de monitoring
- **Contact** : Équipe technique pour assistance

## 🎉 Conclusion

Le système de relances intelligentes IA de N'zoo Immo offre une solution complète et automatisée pour optimiser la rétention client. Avec ses algorithmes avancés, son interface intuitive et ses capacités d'évolutivité, il constitue un outil puissant pour maximiser l'engagement et la fidélité des clients.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 15 janvier 2025  
**Auteur** : Équipe N'zoo Immo
