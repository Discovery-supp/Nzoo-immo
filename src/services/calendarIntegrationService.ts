import { supabase } from './supabaseClient';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  allDay: boolean;
  recurrence?: string;
  attendees?: string[];
  organizer?: string;
  calendarId: string;
  externalId?: string;
  source: 'google' | 'outlook' | 'ical' | 'internal';
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  type: 'google' | 'outlook' | 'ical';
  name: string;
  color: string;
  enabled: boolean;
  sync_direction: 'one_way' | 'two_way';
  last_sync: string;
  settings: Record<string, any>;
}

export interface CalendarSyncResult {
  success: boolean;
  events_added: number;
  events_updated: number;
  events_deleted: number;
  errors: string[];
}

// Configuration des fournisseurs de calendrier
export const CALENDAR_PROVIDERS = {
  GOOGLE: {
    name: 'Google Calendar',
    icon: '📅',
    color: '#4285F4',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    scope: 'https://www.googleapis.com/auth/calendar',
    apiBase: 'https://www.googleapis.com/calendar/v3'
  },
  OUTLOOK: {
    name: 'Outlook Calendar',
    icon: '📧',
    color: '#0078D4',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'Calendars.ReadWrite',
    apiBase: 'https://graph.microsoft.com/v1.0'
  },
  ICAL: {
    name: 'iCal',
    icon: '🍎',
    color: '#000000',
    authUrl: null,
    scope: null,
    apiBase: null
  }
} as const;

// Authentification Google Calendar
export const authenticateGoogleCalendar = async (): Promise<boolean> => {
  try {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/calendar/callback`;
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
    authUrl.searchParams.set('client_id', clientId || '');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    // Ouvrir la fenêtre d'authentification
    const authWindow = window.open(
      authUrl.toString(),
      'google-calendar-auth',
      'width=500,height=600'
    );
    
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          resolve(false);
        }
      }, 1000);
      
      // Écouter le message de callback
      window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data.type === 'GOOGLE_CALENDAR_AUTH') {
          clearInterval(checkClosed);
          authWindow?.close();
          
          if (event.data.success) {
            saveCalendarIntegration('google', event.data.accessToken, event.data.refreshToken);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google Calendar:', error);
    return false;
  }
};

// Authentification Outlook Calendar
export const authenticateOutlookCalendar = async (): Promise<boolean> => {
  try {
    const clientId = process.env.VITE_MICROSOFT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/calendar/callback`;
    
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.set('client_id', clientId || '');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'Calendars.ReadWrite');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('response_mode', 'query');
    
    // Ouvrir la fenêtre d'authentification
    const authWindow = window.open(
      authUrl.toString(),
      'outlook-calendar-auth',
      'width=500,height=600'
    );
    
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          resolve(false);
        }
      }, 1000);
      
      // Écouter le message de callback
      window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data.type === 'OUTLOOK_CALENDAR_AUTH') {
          clearInterval(checkClosed);
          authWindow?.close();
          
          if (event.data.success) {
            saveCalendarIntegration('outlook', event.data.accessToken, event.data.refreshToken);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Outlook Calendar:', error);
    return false;
  }
};

// Ajouter un calendrier iCal
export const addICalCalendar = async (url: string, name: string): Promise<boolean> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;
    
    const { error } = await supabase
      .from('calendar_integrations')
      .insert({
        user_id: userId,
        type: 'ical',
        name,
        color: '#000000',
        enabled: true,
        sync_direction: 'one_way',
        settings: { url }
      });
    
    if (error) {
      console.error('Erreur lors de l\'ajout du calendrier iCal:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du calendrier iCal:', error);
    return false;
  }
};

// Sauvegarder l'intégration de calendrier
const saveCalendarIntegration = async (
  type: 'google' | 'outlook',
  accessToken: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;
    
    const { error } = await supabase
      .from('calendar_integrations')
      .upsert({
        user_id: userId,
        type,
        name: CALENDAR_PROVIDERS[type.toUpperCase() as keyof typeof CALENDAR_PROVIDERS].name,
        color: CALENDAR_PROVIDERS[type.toUpperCase() as keyof typeof CALENDAR_PROVIDERS].color,
        enabled: true,
        sync_direction: 'two_way',
        settings: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expiry: new Date(Date.now() + 3600000).toISOString() // 1 heure
        }
      });
    
    if (error) {
      console.error('Erreur lors de la sauvegarde de l\'intégration:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'intégration:', error);
    return false;
  }
};

// Récupérer les intégrations de calendrier d'un utilisateur
export const getUserCalendarIntegrations = async (userId: string): Promise<CalendarIntegration[]> => {
  try {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des intégrations:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des intégrations:', error);
    return [];
  }
};

// Synchroniser les événements avec un calendrier externe
export const syncCalendarEvents = async (
  integrationId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarSyncResult> => {
  try {
    // Récupérer l'intégration
    const { data: integration, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();
    
    if (error || !integration) {
      return {
        success: false,
        events_added: 0,
        events_updated: 0,
        events_deleted: 0,
        errors: ['Intégration non trouvée']
      };
    }
    
    let result: CalendarSyncResult;
    
    switch (integration.type) {
      case 'google':
        result = await syncGoogleCalendar(integration, startDate, endDate);
        break;
      case 'outlook':
        result = await syncOutlookCalendar(integration, startDate, endDate);
        break;
      case 'ical':
        result = await syncICalCalendar(integration, startDate, endDate);
        break;
      default:
        result = {
          success: false,
          events_added: 0,
          events_updated: 0,
          events_deleted: 0,
          errors: ['Type de calendrier non supporté']
        };
    }
    
    // Mettre à jour la date de dernière synchronisation
    if (result.success) {
      await supabase
        .from('calendar_integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integrationId);
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return {
      success: false,
      events_added: 0,
      events_updated: 0,
      events_deleted: 0,
      errors: [error instanceof Error ? error.message : 'Erreur inconnue']
    };
  }
};

// Synchronisation Google Calendar
const syncGoogleCalendar = async (
  integration: CalendarIntegration,
  startDate: Date,
  endDate: Date
): Promise<CalendarSyncResult> => {
  try {
    const accessToken = integration.settings.access_token;
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();
    
    const response = await fetch(
      `${CALENDAR_PROVIDERS.GOOGLE.apiBase}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des événements Google');
    }
    
    const data = await response.json();
    const events = data.items || [];
    
    // Traiter les événements
    const result = await processExternalEvents(events, 'google', integration.id);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la synchronisation Google Calendar:', error);
    return {
      success: false,
      events_added: 0,
      events_updated: 0,
      events_deleted: 0,
      errors: [error instanceof Error ? error.message : 'Erreur Google Calendar']
    };
  }
};

// Synchronisation Outlook Calendar
const syncOutlookCalendar = async (
  integration: CalendarIntegration,
  startDate: Date,
  endDate: Date
): Promise<CalendarSyncResult> => {
  try {
    const accessToken = integration.settings.access_token;
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();
    
    const response = await fetch(
      `${CALENDAR_PROVIDERS.OUTLOOK.apiBase}/me/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des événements Outlook');
    }
    
    const data = await response.json();
    const events = data.value || [];
    
    // Traiter les événements
    const result = await processExternalEvents(events, 'outlook', integration.id);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la synchronisation Outlook Calendar:', error);
    return {
      success: false,
      events_added: 0,
      events_updated: 0,
      events_deleted: 0,
      errors: [error instanceof Error ? error.message : 'Erreur Outlook Calendar']
    };
  }
};

// Synchronisation iCal
const syncICalCalendar = async (
  integration: CalendarIntegration,
  startDate: Date,
  endDate: Date
): Promise<CalendarSyncResult> => {
  try {
    const url = integration.settings.url;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du calendrier iCal');
    }
    
    const icalData = await response.text();
    const events = parseICalData(icalData, startDate, endDate);
    
    // Traiter les événements
    const result = await processExternalEvents(events, 'ical', integration.id);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la synchronisation iCal:', error);
    return {
      success: false,
      events_added: 0,
      events_updated: 0,
      events_deleted: 0,
      errors: [error instanceof Error ? error.message : 'Erreur iCal']
    };
  }
};

// Traiter les événements externes
const processExternalEvents = async (
  events: any[],
  source: 'google' | 'outlook' | 'ical',
  integrationId: string
): Promise<CalendarSyncResult> => {
  let added = 0;
  let updated = 0;
  let deleted = 0;
  const errors: string[] = [];
  
  for (const event of events) {
    try {
      const calendarEvent = convertToCalendarEvent(event, source, integrationId);
      
      // Vérifier si l'événement existe déjà
      const { data: existingEvent } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('external_id', calendarEvent.externalId)
        .eq('calendar_id', integrationId)
        .single();
      
      if (existingEvent) {
        // Mettre à jour l'événement existant
        const { error } = await supabase
          .from('calendar_events')
          .update(calendarEvent)
          .eq('id', existingEvent.id);
        
        if (error) {
          errors.push(`Erreur mise à jour événement ${calendarEvent.title}: ${error.message}`);
        } else {
          updated++;
        }
      } else {
        // Ajouter un nouvel événement
        const { error } = await supabase
          .from('calendar_events')
          .insert(calendarEvent);
        
        if (error) {
          errors.push(`Erreur ajout événement ${calendarEvent.title}: ${error.message}`);
        } else {
          added++;
        }
      }
    } catch (error) {
      errors.push(`Erreur traitement événement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
  
  return {
    success: errors.length === 0,
    events_added: added,
    events_updated: updated,
    events_deleted: deleted,
    errors
  };
};

// Convertir un événement externe en format standard
const convertToCalendarEvent = (
  event: any,
  source: 'google' | 'outlook' | 'ical',
  integrationId: string
): Omit<CalendarEvent, 'id'> => {
  switch (source) {
    case 'google':
      return {
        title: event.summary || 'Sans titre',
        description: event.description,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        location: event.location,
        allDay: !event.start.dateTime,
        recurrence: event.recurrenceRule,
        attendees: event.attendees?.map((a: any) => a.email) || [],
        organizer: event.organizer?.email,
        calendarId: integrationId,
        externalId: event.id,
        source: 'google'
      };
    
    case 'outlook':
      return {
        title: event.subject || 'Sans titre',
        description: event.body?.content,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        location: event.location?.displayName,
        allDay: event.isAllDay,
        recurrence: event.recurrence?.pattern?.type,
        attendees: event.attendees?.map((a: any) => a.emailAddress?.address) || [],
        organizer: event.organizer?.emailAddress?.address,
        calendarId: integrationId,
        externalId: event.id,
        source: 'outlook'
      };
    
    case 'ical':
      return {
        title: event.summary || 'Sans titre',
        description: event.description,
        start: new Date(event.start),
        end: new Date(event.end),
        location: event.location,
        allDay: event.allDay,
        recurrence: event.rrule,
        attendees: event.attendees || [],
        organizer: event.organizer,
        calendarId: integrationId,
        externalId: event.uid,
        source: 'ical'
      };
    
    default:
      throw new Error('Source de calendrier non supportée');
  }
};

// Parser les données iCal
const parseICalData = (icalData: string, startDate: Date, endDate: Date): any[] => {
  // Implémentation basique du parsing iCal
  // En production, utilisez une bibliothèque comme ical.js
  const events: any[] = [];
  const lines = icalData.split('\n');
  
  let currentEvent: any = {};
  let inEvent = false;
  
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
      inEvent = true;
    } else if (line.startsWith('END:VEVENT')) {
      if (inEvent) {
        events.push(currentEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      const [key, value] = line.split(':');
      if (key && value) {
        currentEvent[key.toLowerCase()] = value;
      }
    }
  }
  
  return events.filter(event => {
    const eventStart = new Date(event.dtstart);
    return eventStart >= startDate && eventStart <= endDate;
  });
};

// Créer un événement dans un calendrier externe
export const createExternalEvent = async (
  integrationId: string,
  event: Omit<CalendarEvent, 'id' | 'source' | 'externalId'>
): Promise<boolean> => {
  try {
    const { data: integration } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();
    
    if (!integration) return false;
    
    switch (integration.type) {
      case 'google':
        return await createGoogleEvent(integration, event);
      case 'outlook':
        return await createOutlookEvent(integration, event);
      default:
        return false;
    }
  } catch (error) {
    console.error('Erreur lors de la création d\'événement externe:', error);
    return false;
  }
};

// Créer un événement Google Calendar
const createGoogleEvent = async (
  integration: CalendarIntegration,
  event: Omit<CalendarEvent, 'id' | 'source' | 'externalId'>
): Promise<boolean> => {
  try {
    const accessToken = integration.settings.access_token;
    
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: event.location,
      attendees: event.attendees?.map(email => ({ email }))
    };
    
    const response = await fetch(
      `${CALENDAR_PROVIDERS.GOOGLE.apiBase}/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la création d\'événement Google:', error);
    return false;
  }
};

// Créer un événement Outlook Calendar
const createOutlookEvent = async (
  integration: CalendarIntegration,
  event: Omit<CalendarEvent, 'id' | 'source' | 'externalId'>
): Promise<boolean> => {
  try {
    const accessToken = integration.settings.access_token;
    
    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description || ''
      },
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: {
        displayName: event.location
      },
      attendees: event.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      }))
    };
    
    const response = await fetch(
      `${CALENDAR_PROVIDERS.OUTLOOK.apiBase}/me/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outlookEvent)
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la création d\'événement Outlook:', error);
    return false;
  }
};
