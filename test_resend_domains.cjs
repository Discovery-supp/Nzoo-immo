#!/usr/bin/env node

/**
 * Test des domaines Resend disponibles
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

async function checkDomains() {
  console.log('🔍 Vérification des domaines Resend disponibles...\n');
  
  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Domaines trouvés:');
      
      if (result.data && result.data.length > 0) {
        result.data.forEach(domain => {
          console.log(`\n📧 Domaine: ${domain.name}`);
          console.log(`   Status: ${domain.status}`);
          console.log(`   Created: ${domain.created_at}`);
          console.log(`   Region: ${domain.region}`);
          
          if (domain.records) {
            console.log(`   Records: ${domain.records.length} enregistrements DNS`);
          }
        });
        
        // Trouver un domaine vérifié
        const verifiedDomain = result.data.find(d => d.status === 'valid');
        if (verifiedDomain) {
          console.log(`\n✅ Domaine vérifié disponible: ${verifiedDomain.name}`);
          return verifiedDomain.name;
        } else {
          console.log('\n⚠️  Aucun domaine vérifié trouvé');
          return null;
        }
      } else {
        console.log('❌ Aucun domaine configuré');
        return null;
      }
    } else {
      const error = await response.text();
      console.log(`❌ Erreur: ${response.status} - ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return null;
  }
}

async function testEmailWithDomain(domain) {
  console.log(`\n📧 Test d'envoi avec le domaine: ${domain}`);
  
  const testHtml = `
    <html>
      <body>
        <h2>Test de configuration Resend</h2>
        <p>Cet email confirme que votre configuration Resend fonctionne correctement.</p>
        <p><strong>Domaine utilisé:</strong> ${domain}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `test@${domain}`,
        to: ['test@example.com'],
        subject: 'Test de configuration Resend - Nzoo Immo',
        html: testHtml
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès');
      console.log(`📧 ID: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Erreur: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return false;
  }
}

async function main() {
  const verifiedDomain = await checkDomains();
  
  if (verifiedDomain) {
    await testEmailWithDomain(verifiedDomain);
  } else {
    console.log('\n💡 Solutions:');
    console.log('1. Vérifiez votre domaine nzoo.immo dans le dashboard Resend');
    console.log('2. Configurez les enregistrements DNS selon les instructions');
    console.log('3. Ou utilisez un email vérifié temporairement');
  }
}

main().catch(console.error);
