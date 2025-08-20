import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ExternalLink, Copy, Mail } from 'lucide-react';
import { testSupabaseConnection } from '../services/supabaseClient';
import { supabase } from '../services/supabaseClient';

interface SupabaseDiagnosticProps {
  onRetry: () => void;
}

const SupabaseDiagnostic: React.FC<SupabaseDiagnosticProps> = ({ onRetry }) => {
  const [diagnosticResult, setDiagnosticResult] = useState<{
    success: boolean;
    error?: string;
    details?: any;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [emailTestResult, setEmailTestResult] = useState<any>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const result = await testSupabaseConnection();
      setDiagnosticResult(result);
    } catch (error) {
      setDiagnosticResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test de la fonction d'email
  const testEmailFunction = async () => {
    setTestingEmail(true);
    try {
      console.log('🧪 Testing email function...');
      
      const { data, error } = await supabase.functions.invoke('send-email-confirmation', {
        body: {
          to: 'test@example.com',
          subject: 'Test Email - Nzoo Immo',
          html: '<h1>Test Email</h1><p>This is a test email from Nzoo Immo system.</p>',
          reservationData: {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
            activity: 'Test Activity',
            spaceType: 'coworking',
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            amount: 100,
            transactionId: 'TEST-123',
            status: 'confirmed'
          }
        }
      });

      if (error) {
        setEmailTestResult({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setEmailTestResult({
          success: true,
          data: data,
          message: 'Email function test completed'
        });
      }
    } catch (err) {
      setEmailTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        details: err
      });
    } finally {
      setTestingEmail(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openSupabaseDocs = () => {
    window.open('https://supabase.com/docs/guides/getting-started/tutorials/with-vite-react', '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Diagnostic Supabase</h3>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Test en cours...' : 'Retester'}
        </button>
      </div>

      {/* Résultat du diagnostic */}
      {diagnosticResult && (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            diagnosticResult.success 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {diagnosticResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {diagnosticResult.success ? 'Connexion réussie' : 'Échec de la connexion'}
              </p>
              {diagnosticResult.error && (
                <p className="text-sm mt-1">{diagnosticResult.error}</p>
              )}
            </div>
          </div>

          {/* Solutions */}
          {!diagnosticResult.success && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Solutions possibles
              </h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-yellow-800">1. Créer un fichier .env.local</p>
                  <div className="bg-gray-100 p-3 rounded mt-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span>VITE_SUPABASE_URL=votre_url_supabase</span>
                      <button
                        onClick={() => copyToClipboard('VITE_SUPABASE_URL=votre_url_supabase')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>VITE_SUPABASE_ANON_KEY=votre_clé_anon</span>
                      <button
                        onClick={() => copyToClipboard('VITE_SUPABASE_ANON_KEY=votre_clé_anon')}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-yellow-800">2. Vérifier votre projet Supabase</p>
                  <p className="text-yellow-700">
                    Assurez-vous que votre projet Supabase est actif et que les clés sont correctes.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-yellow-800">3. Exécuter les migrations</p>
                  <p className="text-yellow-700">
                    Si c'est un nouveau projet, exécutez les migrations pour créer les tables nécessaires.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-yellow-800">4. Vérifier la connexion internet</p>
                  <p className="text-yellow-700">
                    Assurez-vous que vous avez une connexion internet stable.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={openSupabaseDocs}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Documentation Supabase
                </button>
                <button
                  onClick={onRetry}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {/* Informations de configuration */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3">Configuration actuelle</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">URL Supabase:</span>
                <span className="font-mono">
                  {import.meta.env.VITE_SUPABASE_URL ? '✅ Configurée' : '❌ Manquante'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clé API:</span>
                <span className="font-mono">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurée' : '❌ Manquante'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-mono">
                  {import.meta.env.DEV ? 'Développement' : 'Production'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Section Diagnostic Email */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" />
            Diagnostic du Système d'Emails
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Configuration Email</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fonction Edge Email :</span>
                  <span className="font-medium">send-confirmation-email</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Email :</span>
                  <span className="font-medium">SendGrid</span>
                </div>
                <div className="flex justify-between">
                  <span>Email d'expédition :</span>
                  <span className="font-medium">reservations@nzooimmo.com</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Configuration Requise</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>Pour que les emails fonctionnent, vous devez :</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Créer un compte SendGrid</li>
                  <li>Obtenir une clé API</li>
                  <li>Configurer SENDGRID_API_KEY dans Supabase</li>
                  <li>Déployer la fonction Edge</li>
                </ol>
                <p className="mt-2">
                  <a 
                    href="https://sendgrid.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Créer un compte SendGrid →
                  </a>
                </p>
              </div>
            </div>

            <button
              onClick={testEmailFunction}
              disabled={testingEmail}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {testingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Test en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Tester la Fonction Email
                </>
              )}
            </button>

            {emailTestResult && (
              <div className={`border rounded-lg p-4 ${
                emailTestResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  emailTestResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {emailTestResult.success ? '✅ Test Réussi' : '❌ Test Échoué'}
                </h4>
                <div className="text-sm space-y-2">
                  {emailTestResult.message && (
                    <p className={emailTestResult.success ? 'text-green-700' : 'text-red-700'}>
                      {emailTestResult.message}
                    </p>
                  )}
                  {emailTestResult.error && (
                    <p className="text-red-700">
                      <strong>Erreur :</strong> {emailTestResult.error}
                    </p>
                  )}
                  {emailTestResult.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600">Détails de la réponse</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(emailTestResult.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default SupabaseDiagnostic;
