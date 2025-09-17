# 👥 Guide des Comptes Clients et Réservations

## 🎯 Vue d'ensemble

Ce guide explique comment le système de comptes clients fonctionne pour afficher **toutes les réservations** d'un client, même celles effectuées avec des adresses email différentes.

## 🔗 **Principe de fonctionnement :**

### **Avant (système basé sur l'email) :**
- ❌ Chaque réservation était liée uniquement à l'email utilisé
- ❌ Si un client utilisait un email différent, la réservation n'apparaissait pas
- ❌ Pas de centralisation des réservations par client

### **Maintenant (système basé sur le compte client) :**
- ✅ Chaque réservation est liée à un **compte client unique**
- ✅ Toutes les réservations d'un client sont affichées, peu importe l'email
- ✅ Centralisation complète des réservations par compte client

## 🏗️ **Architecture du système :**

### **1. Table `clients`**
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,           -- Identifiant unique du compte client
  full_name TEXT NOT NULL,       -- Nom complet du client
  email TEXT UNIQUE NOT NULL,    -- Email principal du compte
  phone TEXT,                    -- Téléphone
  company TEXT,                  -- Entreprise
  activity TEXT,                 -- Activité
  address TEXT,                  -- Adresse
  total_reservations INTEGER,    -- Nombre total de réservations
  total_spent DECIMAL(10,2),     -- Montant total dépensé
  last_reservation_date TIMESTAMP, -- Date de la dernière réservation
  account_status VARCHAR(20),    -- Statut du compte
  account_type VARCHAR(20),      -- Type de compte
  created_at TIMESTAMP,          -- Date de création
  updated_at TIMESTAMP           -- Date de mise à jour
);
```

### **2. Table `reservations` avec `client_id`**
```sql
ALTER TABLE reservations 
ADD COLUMN client_id UUID REFERENCES clients(id);
```

### **3. Fonction RPC `get_or_create_client`**
```sql
CREATE OR REPLACE FUNCTION get_or_create_client(
  client_email text,
  client_full_name text,
  client_phone text,
  client_company text DEFAULT NULL,
  client_activity text DEFAULT NULL,
  client_address text DEFAULT NULL
)
RETURNS uuid
```

## 🔄 **Flux de création d'une réservation :**

### **Étape 1 : Création/récupération du compte client**
```typescript
// Dans reservationService.ts
const { data: clientResult, error: clientError } = await supabase
  .rpc('get_or_create_client', {
    client_email: data.email,
    client_full_name: data.fullName,
    client_phone: data.phone,
    client_company: data.company || null,
    client_activity: data.activity,
    client_address: data.address || null
  });
```

### **Étape 2 : Liaison de la réservation au compte client**
```typescript
const reservationData = {
  // ... autres données
  client_id: clientId, // Lier la réservation au compte client
  created_at: new Date().toISOString()
};
```

### **Étape 3 : Mise à jour des statistiques du client**
```typescript
await supabase.rpc('update_client_stats', { client_uuid: clientId });
```

## 📱 **Affichage dans le dashboard client :**

### **1. Filtrage par `client_id` dans `useReservations`**
```typescript
// Dans useReservations.ts
if (filterByUser && filterByUser.role === 'clients' && filterByUser.email) {
  // Récupérer le client_id de l'utilisateur
  const { data: clientData } = await supabase
    .from('clients')
    .select('id')
    .eq('email', filterByUser.email)
    .single();
  
  if (clientData) {
    // Filtrer par client_id au lieu de l'email
    query = query.eq('client_id', clientData.id);
  }
}
```

### **2. Affichage de toutes les réservations liées**
```typescript
// Dans AdminDashboard.tsx
if (userProfile?.role === 'clients') {
  // Toutes les réservations sont déjà filtrées par client_id
  // donc on peut les afficher toutes
  filtered = filtered.filter(r => {
    if (r.client_id) {
      return true; // Réservation liée au compte client
    }
    // Fallback pour les anciennes réservations
    return r.email === userProfile.email;
  });
}
```

## 🎨 **Interface utilisateur :**

### **Message informatif pour les clients :**
```jsx
{userProfile?.role === 'clients' && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
    <div className="flex items-start space-x-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-800">
        <p className="font-semibold mb-1">📋 Toutes vos réservations sont affichées ici</p>
        <p className="text-blue-700">
          Cette liste affiche <strong>toutes les réservations liées à votre compte client</strong>, 
          même celles effectuées avec des adresses email différentes. 
          Votre compte client centralise toutes vos réservations pour une gestion simplifiée.
        </p>
      </div>
    </div>
  </div>
)}
```

## 🔍 **Exemples de scénarios :**

### **Scénario 1 : Client avec plusieurs emails**
```
Compte client : john.doe@company.com
Réservations :
- ID1 : john.doe@company.com (email principal)
- ID2 : john.doe@gmail.com (email personnel)
- ID3 : j.doe@company.com (email alternatif)

Résultat : Toutes les 3 réservations sont affichées dans le dashboard
```

### **Scénario 2 : Client changeant d'email**
```
Compte client : old.email@company.com → new.email@company.com
Réservations :
- ID1 : old.email@company.com (ancien email)
- ID2 : new.email@company.com (nouvel email)

Résultat : Les 2 réservations restent visibles dans le dashboard
```

### **Scénario 3 : Réservations pour différents projets**
```
Compte client : manager@company.com
Réservations :
- ID1 : manager@company.com (projet A)
- ID2 : project.b@company.com (projet B)
- ID3 : event@company.com (événement)

Résultat : Toutes les réservations sont centralisées dans un seul dashboard
```

## 🛠️ **Services disponibles :**

### **1. `ClientReservationService`**
```typescript
// Récupérer toutes les réservations d'un client
const reservations = await ClientReservationService.getReservationsByClientId(clientId);

// Récupérer par email (avec conversion automatique en client_id)
const reservations = await ClientReservationService.getReservationsByEmail(email);

// Statistiques des réservations
const stats = await ClientReservationService.getClientReservationStats(clientId);

// Réservations avec pagination
const result = await ClientReservationService.getReservationsByClientIdPaginated(clientId, 1, 10);
```

### **2. `ClientAccountService`**
```typescript
// Créer ou récupérer un client
const client = await ClientAccountService.getOrCreateClient(clientData);

// Mettre à jour les statistiques
await ClientAccountService.updateClientStats(clientId);

// Récupérer tous les clients avec statistiques
const clients = await ClientAccountService.getAllClientsWithStats();
```

## 📊 **Avantages du système :**

### **Pour les clients :**
- ✅ **Vue centralisée** de toutes leurs réservations
- ✅ **Historique complet** peu importe l'email utilisé
- ✅ **Gestion simplifiée** des réservations multiples
- ✅ **Statistiques consolidées** de leur activité

### **Pour les administrateurs :**
- ✅ **Suivi client** centralisé et cohérent
- ✅ **Statistiques précises** par compte client
- ✅ **Gestion des comptes** simplifiée
- ✅ **Historique complet** des interactions

### **Pour le système :**
- ✅ **Intégrité des données** garantie
- ✅ **Performance améliorée** avec index sur client_id
- ✅ **Évolutivité** pour de nouvelles fonctionnalités
- ✅ **Traçabilité** complète des réservations

## 🚀 **Déploiement :**

### **1. Exécuter la migration SQL**
```sql
-- Dans Supabase SQL Editor
-- supabase/migrations/20250121000000_client_account_management.sql
```

### **2. Vérifier la création des tables**
```sql
-- Vérifier que les tables existent
SELECT * FROM clients LIMIT 1;
SELECT * FROM reservations WHERE client_id IS NOT NULL LIMIT 1;
```

### **3. Tester le système**
```bash
# Créer une réservation test
# Vérifier qu'elle apparaît dans le dashboard client
# Tester avec différents emails
```

## 🔧 **Maintenance :**

### **1. Vérification des liens**
```sql
-- Vérifier les réservations sans client_id
SELECT * FROM reservations WHERE client_id IS NULL;

-- Vérifier les clients sans réservations
SELECT c.* FROM clients c 
LEFT JOIN reservations r ON c.id = r.client_id 
WHERE r.id IS NULL;
```

### **2. Nettoyage des données**
```sql
-- Mettre à jour les anciennes réservations sans client_id
-- (si nécessaire, créer des comptes clients pour les anciennes réservations)
```

---

**Version :** 1.0  
**Date :** 21 Janvier 2025  
**Auteur :** Équipe Technique Nzoo Immo
