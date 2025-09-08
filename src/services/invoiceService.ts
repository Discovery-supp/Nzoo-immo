import { type Reservation } from '../types';
import { validateAndFormatInvoiceDates, generateInvoiceNumber } from '../utils/dateUtils';
import { logger } from '../utils/logger';
import { getFormattedSpaceText } from '../utils/spaceDisplayHelper';

// Logo inline pour éviter les erreurs de chemin lors de l'ouverture locale du fichier HTML
const LOGO_SVG = `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 96.992"><g><g><path fill="#183154" d="M82.579,82.263H42.793c-1.523,0-2.758-1.235-2.758-2.758s1.235-2.758,2.758-2.758H79.82V30.061 c0-1.523,1.235-2.758,2.758-2.758s2.758,1.235,2.758,2.758v49.444C85.337,81.028,84.102,82.263,82.579,82.263z"/><path fill="#183154" d="M96.623,32.052c-0.46,0-0.926-0.115-1.355-0.358L49.692,5.927L4.116,31.695 c-1.326,0.75-3.009,0.283-3.758-1.043c-0.75-1.326-0.283-3.009,1.043-3.758L48.335,0.357c0.842-0.476,1.873-0.476,2.715,0 l46.934,26.536c1.326,0.75,1.793,2.432,1.043,3.758C98.52,31.548,97.585,32.052,96.623,32.052z"/><path fill="#183154" d="M16.806,54.024c-1.523,0-2.758-1.235-2.758-2.758V30.061c0-1.523,1.235-2.758,2.758-2.758 s2.758,1.235,2.758,2.758v21.206C19.564,52.789,18.329,54.024,16.806,54.024z"/><path fill="#183154" d="M34.207,82.263H16.806c-1.523,0-2.758-1.235-2.758-2.758V59.804c0-1.523,1.235-2.758,2.758-2.758 h14.643V30.061c0-0.973,0.513-1.874,1.349-2.371l15.485-9.199c0.858-0.51,1.923-0.516,2.787-0.018l15.945,9.199 c0.854,0.493,1.38,1.403,1.38,2.389v29.743c0,1.523-1.235,2.758-2.758,2.758H36.965v16.943 C36.965,81.028,35.731,82.263,34.207,82.263z M19.564,76.747h11.885V62.562H19.564V76.747z M36.965,57.046h25.914V31.654 l-13.167-7.596L36.965,31.63V57.046z"/></g><g><path fill="#183154" d="M119.288,64.201h-3.974L103.358,46.04v18.161h-3.974V39.627h3.974l11.956,18.231V39.627h3.974 V64.201z"/><path fill="#183154" d="M127.166,39.661c0,1.394-0.331,2.464-0.993,3.207c-0.662,0.744-1.633,1.116-2.911,1.116v-1.673 c0.581,0,1.011-0.168,1.29-0.506c0.279-0.336,0.418-0.842,0.418-1.516v-0.732h-1.882v-3.381h3.59 C127.003,37.268,127.166,38.43,127.166,39.661z"/><path fill="#183154" d="M134.451,60.959h11.957v3.242h-16.383v-3.102l11.712-18.265h-11.468v-3.242h15.964v3.102 L134.451,60.959z"/><path fill="#183154" d="M167.861,40.882c1.847,1.069,3.299,2.562,4.357,4.479c1.057,1.917,1.586,4.084,1.586,6.501 c0,2.417-0.529,4.584-1.586,6.501c-1.058,1.917-2.51,3.416-4.357,4.497c-1.848,1.08-3.91,1.621-6.187,1.621 c-2.301,0-4.375-0.54-6.222-1.621c-1.848-1.081-3.306-2.58-4.375-4.497c-1.069-1.917-1.603-4.084-1.603-6.501 c0-2.417,0.534-4.584,1.603-6.501c1.069-1.917,2.527-3.41,4.375-4.479c1.847-1.069,3.921-1.603,6.222-1.603 C163.951,39.278,166.014,39.813,167.861,40.882z M157.456,44.053c-1.232,0.721-2.191,1.755-2.876,3.102 c-0.686,1.348-1.028,2.917-1.028,4.706c0,1.79,0.343,3.358,1.028,4.706c0.685,1.348,1.644,2.382,2.876,3.103 c1.231,0.72,2.637,1.08,4.218,1.08c1.557,0,2.945-0.36,4.165-1.08s2.173-1.755,2.858-3.103c0.685-1.347,1.028-2.916,1.028-4.706 c0-1.789-0.343-3.358-1.028-4.706c-0.686-1.347-1.638-2.382-2.858-3.102c-1.22-0.72-2.609-1.08-4.165-1.08 C160.093,42.973,158.688,43.333,157.456,44.053z"/><path fill="#183154" d="M194.057,40.882c1.847,1.069,3.299,2.562,4.357,4.479c1.057,1.917,1.586,4.084,1.586,6.501 c0,2.417-0.529,4.584-1.586,6.501c-1.058,1.917-2.51,3.416-4.357,4.497c-1.848,1.08-3.91,1.621-6.187,1.621 c-2.301,0-4.375-0.54-6.222-1.621c-1.848-1.081-3.306-2.58-4.375-4.497c-1.069-1.917-1.603-4.084-1.603-6.501 c0-2.417,0.534-4.584,1.603-6.501c1.069-1.917,2.527-3.41,4.375-4.479c1.847-1.069,3.921-1.603,6.222-1.603 C190.147,39.278,192.209,39.813,194.057,40.882z M183.652,44.053c-1.232,0.721-2.191,1.755-2.876,3.102 c-0.686,1.348-1.028,2.917-1.028,4.706c0,1.79,0.343,3.358,1.028,4.706c0.685,1.348,1.644,2.382,2.876,3.103 c1.231,0.72,2.637,1.08,4.218,1.08c1.557,0,2.945-0.36,4.165-1.08s2.173-1.755,2.858-3.103c0.685-1.347,1.028-2.916,1.028-4.706 c0-1.789-0.343-3.358-1.028-4.706c-0.686-1.347-1.638-2.382-2.858-3.102c-1.22-0.72-2.609-1.08-4.165-1.08 C186.289,42.973,184.883,43.333,183.652,44.053z"/></g></g><path fill="#183154" d="M197.085,96.992H16.963c-1.61,0-2.915-1.305-2.915-2.915c0-1.61,1.305-2.915,2.915-2.915h180.122 c1.61,0,2.915,1.305,2.915,2.915C200,95.687,198.695,96.992,197.085,96.992z"/></svg>`;
const LOGO_DATA_URL = 'data:image/svg+xml;utf8,' + encodeURIComponent(LOGO_SVG);

// Interface pour les données de facture
interface InvoiceData {
  reservation: Reservation;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
}

// Interface pour les données de réservation
interface ReservationData {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  activity: string;
  address: string;
  spaceType: string;
  startDate: string;
  endDate: string;
  occupants: number;
  subscriptionType: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  created_at?: string; // Added for reservation date
}

// Utilisation de la fonction utilitaire centralisée
// validateAndFormatInvoiceDates est maintenant importée depuis ../utils/dateUtils

// Fonction de test pour valider la cohérence des dates
export const testDateConsistency = () => {
  console.log('🧪 Test de cohérence des dates...');
  
  const testCases = [
    {
      name: 'Dates valides',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      createdDate: '2024-11-15'
    },
    {
      name: 'Dates incohérentes (début après fin)',
      startDate: '2024-12-31',
      endDate: '2024-12-01',
      createdDate: '2024-11-15'
    },
    {
      name: 'Date de début dans le passé',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      createdDate: '2024-11-15'
    }
  ];
  
  testCases.forEach(testCase => {
    try {
      console.log(`\n📅 Test: ${testCase.name}`);
      const dates = validateAndFormatInvoiceDates(testCase.startDate, testCase.endDate, testCase.createdDate);
      console.log('✅ Résultat:', dates);
    } catch (error) {
      console.log('❌ Erreur:', error instanceof Error ? error.message : String(error));
    }
  });
  
  console.log('\n✅ Tests de cohérence des dates terminés');
};

// Fonction pour formater le type d'espace
const formatSpaceType = (spaceType: string): string => {
  const types: Record<string, string> = {
    'coworking': 'Espace Coworking',
    'bureau-prive': 'Bureau Privé',
    'bureau_prive': 'Bureau Privé',
    'salle-reunion': 'Salle de Réunion',
    'domiciliation': 'Service de Domiciliation'
  };
  return types[spaceType] || spaceType;
};

// Fonction pour formater la méthode de paiement
const formatPaymentMethod = (paymentMethod: string): string => {
  const methods: Record<string, string> = {
    'mobile_money': 'Mobile Money',
    'orange_money': 'Orange Money',
    'airtel_money': 'Airtel Money',
    'bank_transfer': 'Virement Bancaire',
    'cash': 'Espèces',
    'card': 'Carte Bancaire',
    'visa': 'Carte VISA'
  };
  return methods[paymentMethod] || paymentMethod;
};

// Fonction pour déterminer le statut selon le mode de paiement
const getReservationStatus = (paymentMethod: string): string => {
  const mobileMoneyMethods = ['mobile_money', 'orange_money', 'airtel_money'];
  return mobileMoneyMethods.includes(paymentMethod) ? 'confirmed' : 'reserved';
};

// Fonction pour générer le contenu HTML de la facture de réservation
const generateReservationInvoiceHTML = (data: ReservationData): string => {
  const { paymentMethod, amount } = data;
  
  const invoiceNumber = `INV-${data.transactionId.slice(0, 8).toUpperCase()}`;
  
  // Valider et formater toutes les dates
  const dates = validateAndFormatInvoiceDates(data.startDate, data.endDate, data.created_at);
  
  const status = getReservationStatus(paymentMethod);
  const isCashPayment = paymentMethod === 'cash';
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facture ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #183154 0%, #1e4a7a 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }
        
        .logo {
          position: absolute;
          top: 20px;
          left: 30px;
          width: 260px;
          height: auto;
          background: transparent;
          border: 0;
          border-radius: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none;
        }
        
        .logo img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 300;
        }
        
        .header p {
          font-size: 1.1em;
          opacity: 0.9;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          padding: 30px;
          border-bottom: 1px solid #f1f3f4;
        }
        
        .company-info, .client-info {
          flex: 1;
        }
        
        .company-info h3, .client-info h3 {
          color: #183154;
          margin-bottom: 15px;
          font-size: 1.2em;
        }
        
        .info-item {
          margin-bottom: 8px;
          font-size: 0.95em;
        }
        
        .invoice-details {
          padding: 30px;
          border-bottom: 2px solid #f1f3f4;
        }
        
        .invoice-details h3 {
          color: #183154;
          margin-bottom: 20px;
          font-size: 1.3em;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .detail-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border-left: 0;
        }
        
        .detail-label {
          font-weight: bold;
          color: #183154;
          font-size: 0.9em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-size: 1.1em;
          color: #333;
        }
        
        .services-table {
          padding: 30px;
          border-bottom: 2px solid #f1f3f4;
        }
        
        .services-table h3 {
          color: #183154;
          margin-bottom: 20px;
          font-size: 1.3em;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #f1f3f4;
        }
        
        th {
          background-color: #f8f9fa;
          color: #183154;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.9em;
        }
        
        .total-section {
          padding: 30px;
          background: #ffffff;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 1.1em;
        }
        
        .total-row.grand-total {
          border-top: 2px solid #183154;
          margin-top: 15px;
          padding-top: 20px;
          font-size: 1.3em;
          font-weight: bold;
          color: #183154;
        }
        
        .footer {
          padding: 30px;
          text-align: center;
          background: #f8f9fa;
          color: #6c757d;
          font-size: 0.9em;
        }
        
        .status-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-confirmed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-reserved {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .payment-notice {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 2px solid #fdcb6e;
          border-radius: 12px;
          padding: 25px;
          margin: 25px 0;
          box-shadow: 0 4px 12px rgba(253, 203, 110, 0.2);
        }
        
        .payment-notice h4 {
          color: #856404;
          margin-bottom: 15px;
          font-size: 1.2em;
          text-align: center;
        }
        
        .payment-details {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        
        .payment-details p {
          margin: 8px 0;
          font-size: 1em;
          color: #2d3436;
        }
        
        .warning {
          background: #ff7675;
          color: white;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
          text-align: center;
          font-weight: bold;
        }
        
        .payment-notice p {
          color: #856404;
          margin-bottom: 5px;
        }
        
        .payment-notice ul {
          margin-left: 20px;
          color: #856404;
        }
        
        @media print {
          body {
            background-color: white;
          }
          
          .invoice-container {
            box-shadow: none;
            margin: 0;
            border-radius: 0;
          }
          
          .logo {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
          }
          
          .logo img {
            filter: contrast(1.2) brightness(1.1);
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">
            <img src="${LOGO_DATA_URL}" alt="N'zoo Immo Logo">
          </div>
          <h1>FACTURE</h1>
          <p>N'zoo Immo - Espaces de Travail</p>
        </div>
        
        <div class="invoice-info">
          <div class="company-info">
            <h3>Émetteur</h3>
            <div class="info-item"><strong>N'zoo Immo</strong></div>
            <div class="info-item">16, colonel Lukusa, Commune de la Gombe</div>
            <div class="info-item">Kinshasa, République Démocratique du Congo</div>
            <div class="info-item">Tél: +243822201758</div>
            <div class="info-item">Email: contact@nzoo-immo.com</div>
          </div>
          
          <div class="client-info">
            <h3>Client</h3>
            <div class="info-item"><strong>${data.fullName}</strong></div>
            <div class="info-item">${data.email}</div>
            <div class="info-item">Tél: ${data.phone}</div>
            ${data.company ? `<div class="info-item">Entreprise: ${data.company}</div>` : ''}
            ${data.address ? `<div class="info-item">Adresse: ${data.address}</div>` : ''}
          </div>
        </div>
        
        <div class="invoice-details">
          <h3>Détails de la Facture</h3>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Numéro de Facture</div>
              <div class="detail-value">${invoiceNumber}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date de Facture</div>
              <div class="detail-value">${dates.createdDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Statut</div>
              <div class="detail-value">
                <span class="status-badge status-${status}">
                  ${status === 'confirmed' ? 'Confirmé' : 'Réservé'}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Type d'Abonnement</div>
              <div class="detail-value">${data.subscriptionType || 'Standard'}</div>
            </div>
          </div>
        </div>
        
        ${isCashPayment ? `
        <div class="payment-notice">
          <h4>💳 Paiement en Espèces</h4>
          <p><strong>Réservation temporaire - Paiement requis</strong></p>
          <div class="payment-details">
            <p>💰 <strong>Montant à payer:</strong> $${amount.toFixed(2)}</p>
            <p>⏰ <strong>Délai:</strong> 3 jours maximum</p>
            <p>📞 <strong>Contact:</strong> +243822201758</p>
            <p>📍 <strong>Lieu:</strong> Direction N'zoo Immo</p>
          </div>
          <p class="warning">⚠️ <strong>Attention:</strong> Réservation automatiquement annulée après 3 jours sans paiement.</p>
        </div>
        ` : ''}
        
        <div class="services-table">
          <h3>Services Facturés</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th>Occupants</th>
                <th>Méthode de Paiement</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${getFormattedSpaceText({ activity: data.activity, space_type: data.spaceType })}</strong><br>
                  <small>${data.activity || 'Réservation d\'espace'}</small>
                </td>
                <td>
                  Du ${dates.startDate}<br>
                  Au ${dates.endDate}
                </td>
                <td>${data.occupants} personne${data.occupants > 1 ? 's' : ''}</td>
                <td>${formatPaymentMethod(data.paymentMethod)}</td>
                <td><strong>$${amount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>Sous-total:</span>
            <span>$${amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>TVA (0%):</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total TTC:</span>
            <span>$${amount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Merci pour votre confiance !</strong></p>
          <p>Pour toute question concernant cette facture, veuillez nous contacter.</p>
          <p>N'zoo Immo - Votre partenaire pour des espaces de travail modernes et flexibles</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Fonction pour générer et télécharger la facture de réservation
export const generateAndDownloadReservationInvoice = async (reservationData: ReservationData): Promise<void> => {
  try {
    // Informations de l'entreprise
    const companyInfo = {
      name: "N'zoo Immo",
      address: "16, colonel Lukusa, Commune de la Gombe",
      city: "Kinshasa, République Démocratique du Congo",
      phone: "+243822201758",
      email: "contact@nzoo-immo.com",
      logo: LOGO_DATA_URL
    };

    // Générer le HTML de la facture
    const htmlContent = generateReservationInvoiceHTML(reservationData);

    // Créer un blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Nom du fichier
    const invoiceNumber = `INV-${reservationData.transactionId.slice(0, 8).toUpperCase()}`;
    const fileName = `Facture_${invoiceNumber}_${reservationData.fullName.replace(/\s+/g, '_')}.html`;
    
    link.download = fileName;
    link.style.display = 'none';
    
    // Ajouter au DOM, cliquer et nettoyer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libérer l'URL
    URL.revokeObjectURL(url);
    
    console.log('Facture de réservation générée avec succès:', fileName);
  } catch (error) {
    console.error('Erreur lors de la génération de la facture de réservation:', error);
    throw new Error('Impossible de générer la facture de réservation');
  }
};

// Fonction pour générer le contenu HTML de la facture
const generateInvoiceHTML = (data: InvoiceData): string => {
  const { reservation, companyInfo } = data;
  
  const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}`;
  
  // Valider et formater toutes les dates
  const dates = validateAndFormatInvoiceDates(reservation.start_date, reservation.end_date, reservation.created_at);
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facture ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #ffffff;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: #ffffff;
          color: #183154;
          padding: 24px 30px 18px;
          text-align: center;
          position: relative;
          border-bottom: 1px solid #e9ecef;
        }
        
        .logo {
          position: absolute;
          top: 20px;
          left: 30px;
          width: 120px;
          height: 120px;
          background: #ffffff;
          border-radius: 15px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #183154;
          box-shadow: 0 4px 15px rgba(24, 49, 84, 0.2);
        }
        
        .logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 700;
          color: #183154;
        }
        
        .header p {
          font-size: 1.1em;
          color: #183154;
          font-weight: 500;
        }
        
        .invoice-info {
          display: flex;
          justify-content: space-between;
          padding: 30px;
          border-bottom: 2px solid #f1f3f4;
          background: #f8f9fa;
        }
        
        .company-info, .client-info {
          flex: 1;
        }
        
        .company-info h3, .client-info h3 {
          color: #183154;
          margin-bottom: 15px;
          font-size: 1.2em;
          font-weight: 700;
        }
        
        .info-item {
          margin-bottom: 8px;
          font-size: 0.95em;
          color: #333;
        }
        
        .invoice-details {
          padding: 30px;
          border-bottom: 2px solid #f1f3f4;
        }
        
        .invoice-details h3 {
          color: #183154;
          margin-bottom: 20px;
          font-size: 1.3em;
          font-weight: 700;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .detail-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #183154;
        }
        
        .detail-label {
          font-weight: bold;
          color: #183154;
          font-size: 0.9em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-size: 1.1em;
          color: #333;
          font-weight: 500;
        }
        
        .services-table {
          padding: 30px;
          border-bottom: 2px solid #f1f3f4;
        }
        
        .services-table h3 {
          color: #183154;
          margin-bottom: 12px;
          font-size: 1.2em;
          font-weight: 700;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }
        
        th {
          background-color: #183154;
          color: white;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.9em;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .total-section {
          padding: 30px;
          background: #f8f9fa;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 1.1em;
        }
        
        .total-row.grand-total {
          border-top: 2px solid #183154;
          margin-top: 15px;
          padding-top: 20px;
          font-size: 1.3em;
          font-weight: bold;
          color: #183154;
        }
        
        .footer {
          padding: 30px;
          text-align: center;
          background: #183154;
          color: white;
          font-size: 0.9em;
        }
        
        .status-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-confirmed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .status-completed {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        .status-cancelled {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .payment-info {
          background: #e3f2fd;
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .payment-info h4 {
          color: #1976d2;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .payment-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        
        .payment-detail {
          background: white;
          padding: 10px;
          border-radius: 6px;
          border-left: 3px solid #2196f3;
        }
        
        .payment-detail strong {
          color: #1976d2;
        }
        
        @media print {
          body {
            background-color: white;
          }
          
          .invoice-container {
            box-shadow: none;
            margin: 0;
            border-radius: 0;
          }
          
          .header {
            background: white !important;
            color: #183154 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">
            <img src="${companyInfo.logo}" alt="N'zoo Immo Logo">
          </div>
          <h1>FACTURE</h1>
          <p>N'zoo Immo - Espaces de Travail</p>
        </div>
        
        <div class="invoice-info">
          <div class="company-info">
            <h3>Émetteur</h3>
            <div class="info-item"><strong>${companyInfo.name}</strong></div>
            <div class="info-item">${companyInfo.address}</div>
            <div class="info-item">${companyInfo.city}</div>
            <div class="info-item">Tél: ${companyInfo.phone}</div>
            <div class="info-item">Email: ${companyInfo.email}</div>
          </div>
          
          <div class="client-info">
            <h3>Client</h3>
            <div class="info-item"><strong>${reservation.full_name}</strong></div>
            <div class="info-item">${reservation.email}</div>
            <div class="info-item">Tél: ${reservation.phone}</div>
            ${reservation.company ? `<div class="info-item">Entreprise: ${reservation.company}</div>` : ''}
            ${reservation.activity ? `<div class="info-item">Activité: ${reservation.activity}</div>` : ''}
            ${reservation.address ? `<div class="info-item">Adresse: ${reservation.address}</div>` : ''}
          </div>
        </div>
        
        <div class="invoice-details">
          <h3>Détails de la Facture</h3>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Numéro de Facture</div>
              <div class="detail-value">${invoiceNumber}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Date de Facture</div>
              <div class="detail-value">${dates.createdDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Statut</div>
              <div class="detail-value">
                <span class="status-badge status-${reservation.status}">
                  ${reservation.status === 'confirmed' ? 'Confirmé' : 
                    reservation.status === 'pending' ? 'En Attente' :
                    reservation.status === 'completed' ? 'Terminé' :
                    reservation.status === 'cancelled' ? 'Annulé' : reservation.status}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Type d'Abonnement</div>
              <div class="detail-value">${reservation.subscription_type || 'Standard'}</div>
            </div>
          </div>
        </div>
        
        <div class="services-table">
          <h3>Services Facturés</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th>Occupants</th>
                <th>Méthode de Paiement</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${getFormattedSpaceText(reservation)}</strong><br>
                  <small>${reservation.activity || 'Réservation d\'espace'}</small>
                </td>
                <td>
                  Du ${dates.startDate}<br>
                  Au ${dates.endDate}
                </td>
                <td>${reservation.occupants} personne${reservation.occupants > 1 ? 's' : ''}</td>
                <td>${formatPaymentMethod(reservation.payment_method)}</td>
                <td><strong>$${reservation.amount}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        

        
        <div class="total-section">
          <div class="total-row">
            <span>Sous-total:</span>
            <span>$${reservation.amount}</span>
          </div>
          <div class="total-row">
            <span>TVA (0%):</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total TTC:</span>
            <span>$${reservation.amount}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Merci pour votre confiance !</strong></p>
          <p>Pour toute question concernant cette facture, veuillez nous contacter.</p>
          <p>N'zoo Immo - Votre partenaire pour des espaces de travail modernes et flexibles</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Fonction pour générer et télécharger la facture PDF
export const generateAndDownloadInvoice = async (reservation: Reservation): Promise<void> => {
  try {
    // Vérifier que la réservation est confirmée
    if (reservation.status !== 'confirmed') {
      throw new Error('Seules les réservations confirmées peuvent générer une facture');
    }

    // Informations de l'entreprise
    const companyInfo = {
      name: "N'zoo Immo",
      address: "16, colonel Lukusa, Commune de la Gombe",
      city: "Kinshasa, République Démocratique du Congo",
      phone: "+243822201758",
      email: "contact@nzoo-immo.com",
      logo: LOGO_DATA_URL
    };

    const invoiceData: InvoiceData = {
      reservation,
      companyInfo
    };

    // Générer le HTML de la facture
    const htmlContent = generateInvoiceHTML(invoiceData);

    // Créer un blob avec le contenu HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Nom du fichier
    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}`;
    const fileName = `Facture_${invoiceNumber}_${reservation.full_name.replace(/\s+/g, '_')}.html`;
    
    link.download = fileName;
    link.style.display = 'none';
    
    // Ajouter au DOM, cliquer et nettoyer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Libérer l'URL
    URL.revokeObjectURL(url);
    
    console.log('Facture générée avec succès:', fileName);
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error);
    throw new Error('Impossible de générer la facture');
  }
};

// Fonction pour générer une facture PDF avec jsPDF (si disponible)
export const generatePDFInvoice = async (reservation: Reservation): Promise<void> => {
  try {
    // Vérifier que la réservation est confirmée
    if (reservation.status !== 'confirmed') {
      throw new Error('Seules les réservations confirmées peuvent générer une facture');
    }

    // Vérifier si jsPDF est disponible
    const jsPDF = (window as any).jsPDF;
    if (!jsPDF) {
      console.warn('jsPDF non disponible, génération HTML à la place');
      return generateAndDownloadInvoice(reservation);
    }

    // Informations de l'entreprise
    const companyInfo = {
      name: "N'zoo Immo",
      address: "16, colonel Lukusa, Commune de la Gombe",
      city: "Kinshasa, République Démocratique du Congo",
      phone: "+243822201758",
      email: "contact@nzoo-immo.com"
    };

    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Configuration des couleurs
    const primaryColor = [24, 49, 84]; // #183154
    const secondaryColor = [108, 117, 125]; // #6c757d
    
    // En-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('FACTURE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text("N'zoo Immo - Espaces de Travail", 105, 30, { align: 'center' });
    
    // Informations de l'entreprise
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.text('Émetteur:', 20, 60);
    
    doc.setFontSize(10);
    doc.text(companyInfo.name, 20, 70);
    doc.text(companyInfo.address, 20, 75);
    doc.text(companyInfo.city, 20, 80);
    doc.text(`Tél: ${companyInfo.phone}`, 20, 85);
    doc.text(`Email: ${companyInfo.email}`, 20, 90);
    
    // Informations du client
    doc.setFontSize(14);
    doc.text('Client:', 120, 60);
    
    doc.setFontSize(10);
    doc.text(reservation.full_name, 120, 70);
    doc.text(reservation.email, 120, 75);
    doc.text(`Tél: ${reservation.phone}`, 120, 80);
    if (reservation.company) {
      doc.text(`Entreprise: ${reservation.company}`, 120, 85);
    }
    
    // Détails de la facture
    const invoiceNumber = `INV-${reservation.id.slice(0, 8).toUpperCase()}`;
    
    // Valider et formater toutes les dates
    const dates = validateAndFormatInvoiceDates(reservation.start_date, reservation.end_date, reservation.created_at);
    
    doc.setFontSize(14);
    doc.text('Détails de la Facture:', 20, 110);
    
    doc.setFontSize(10);
    doc.text(`Numéro: ${invoiceNumber}`, 20, 120);
    doc.text(`Date: ${dates.createdDate}`, 20, 125);
    doc.text(`Statut: ${reservation.status}`, 20, 130);
    doc.text(`Type d'abonnement: ${reservation.subscription_type || 'Standard'}`, 20, 135);
    
    // Services
    doc.setFontSize(14);
    doc.text('Services Facturés:', 20, 160);
    
    doc.setFontSize(10);
    doc.text(`Service: ${getFormattedSpaceText(reservation)}`, 20, 170);
    doc.text(`Période: Du ${dates.startDate} au ${dates.endDate}`, 20, 175);
    doc.text(`Occupants: ${reservation.occupants} personne${reservation.occupants > 1 ? 's' : ''}`, 20, 180);
    doc.text(`Méthode de paiement: ${formatPaymentMethod(reservation.payment_method)}`, 20, 185);
    
    // Total
    doc.setFontSize(14);
    doc.text('Total:', 20, 200);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`$${reservation.amount}`, 120, 200);
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('Merci pour votre confiance !', 105, 255, { align: 'center' });
    doc.text("N'zoo Immo - Votre partenaire pour des espaces de travail modernes et flexibles", 105, 260, { align: 'center' });
    
    // Télécharger le PDF
    const fileName = `Facture_${invoiceNumber}_${reservation.full_name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    console.log('Facture PDF générée avec succès:', fileName);
  } catch (error) {
    console.error('Erreur lors de la génération de la facture PDF:', error);
    // Fallback vers la version HTML
    return generateAndDownloadInvoice(reservation);
  }
};
