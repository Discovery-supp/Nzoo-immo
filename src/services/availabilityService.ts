import { supabase } from './supabaseClient';

export interface AvailabilityCheck {
  isAvailable: boolean;
  conflictingReservations: number;
  maxCapacity: number;
  suggestedDates?: { start: string; end: string }[];
  message?: string;
}

// Nouvelle interface pour la disponibilité générale
export interface GeneralAvailability {
  spaceType: string;
  isAvailable: boolean;
  currentOccupancy: number;
  maxCapacity: number;
  availableSlots: number;
  message?: string;
}

export const checkSpaceAvailability = async (
  spaceType: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityCheck> => {
  try {
    console.log('🔍 Checking availability for:', { spaceType, startDate, endDate });

    // Définir les capacités maximales par type d'espace
    const maxCapacities = {
      'coworking': 4,
      'bureau_prive': 3,
      'bureau-prive': 3,
      'domiciliation': 1
    };

    const maxCapacity = maxCapacities[spaceType as keyof typeof maxCapacities] || 4;

    // Vérifier les réservations confirmées et en attente qui se chevauchent avec la période demandée
    const { data: conflictingReservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('space_type', spaceType)
      .in('status', ['confirmed', 'pending'])
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (error) {
      console.error('❌ Error checking availability:', error);
      throw error;
    }

    const conflictCount = conflictingReservations?.length || 0;
    console.log(`📊 Found ${conflictCount} conflicting reservations for ${spaceType}`);

    const isAvailable = conflictCount < maxCapacity;

    if (!isAvailable) {
      // Suggérer des dates alternatives
      const suggestedDates = await findAlternativeDates(spaceType, startDate, endDate, maxCapacity);
      
      return {
        isAvailable: false,
        conflictingReservations: conflictCount,
        maxCapacity,
        suggestedDates,
        message: `Désolé, nous avons atteint la capacité maximale (${maxCapacity} réservations) pour ${spaceType} sur cette période.`
      };
    }

    return {
      isAvailable: true,
      conflictingReservations: conflictCount,
      maxCapacity
    };

  } catch (error) {
    console.error('❌ Error in checkSpaceAvailability:', error);
    throw error;
  }
};

// Nouvelle fonction pour vérifier la disponibilité générale d'un type d'espace
export const checkGeneralSpaceAvailability = async (spaceType: string): Promise<GeneralAvailability> => {
  try {
    console.log('🔍 Checking general availability for:', spaceType);

    // Définir les capacités maximales par type d'espace
    const maxCapacities = {
      'coworking': 4,
      'bureau_prive': 3,
      'bureau-prive': 3,
      'domiciliation': 1
    };

    const maxCapacity = maxCapacities[spaceType as keyof typeof maxCapacities] || 4;

    // Vérifier toutes les réservations actives (confirmées et en attente) pour ce type d'espace
    const { data: activeReservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('space_type', spaceType)
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('❌ Error checking general availability:', error);
      throw error;
    }

    const currentOccupancy = activeReservations?.length || 0;
    const availableSlots = Math.max(0, maxCapacity - currentOccupancy);
    const isAvailable = availableSlots > 0;

    console.log(`📊 General availability for ${spaceType}: ${currentOccupancy}/${maxCapacity} occupied, ${availableSlots} available`);

    return {
      spaceType,
      isAvailable,
      currentOccupancy,
      maxCapacity,
      availableSlots,
      message: isAvailable 
        ? `${availableSlots} place(s) disponible(s)`
        : `Complet - ${maxCapacity} place(s) occupée(s)`
    };

  } catch (error) {
    console.error('❌ Error in checkGeneralSpaceAvailability:', error);
    // En cas d'erreur, retourner une disponibilité par défaut
    return {
      spaceType,
      isAvailable: true, // Par défaut disponible en cas d'erreur
      currentOccupancy: 0,
      maxCapacity: 4,
      availableSlots: 4,
      message: 'Disponibilité temporairement indisponible'
    };
  }
};

// Fonction pour vérifier la disponibilité de tous les types d'espaces
export const checkAllSpacesAvailability = async (): Promise<Record<string, GeneralAvailability>> => {
  try {
    console.log('🔍 Checking availability for all spaces');

    const spaceTypes = ['coworking', 'bureau-prive', 'domiciliation'];
    const availabilityMap: Record<string, GeneralAvailability> = {};

    // Vérifier la disponibilité pour chaque type d'espace
    for (const spaceType of spaceTypes) {
      try {
        const availability = await checkGeneralSpaceAvailability(spaceType);
        availabilityMap[spaceType] = availability;
      } catch (error) {
        console.error(`❌ Error checking availability for ${spaceType}:`, error);
        // En cas d'erreur, marquer comme disponible par défaut
        availabilityMap[spaceType] = {
          spaceType,
          isAvailable: true,
          currentOccupancy: 0,
          maxCapacity: 4,
          availableSlots: 4,
          message: 'Disponibilité temporairement indisponible'
        };
      }
    }

    console.log('📊 All spaces availability:', availabilityMap);
    return availabilityMap;

  } catch (error) {
    console.error('❌ Error in checkAllSpacesAvailability:', error);
    throw error;
  }
};

const findAlternativeDates = async (
  spaceType: string,
  requestedStart: string,
  requestedEnd: string,
  maxCapacity: number
): Promise<{ start: string; end: string }[]> => {
  const suggestions: { start: string; end: string }[] = [];
  const requestedStartDate = new Date(requestedStart);
  const requestedEndDate = new Date(requestedEnd);
  const duration = Math.ceil((requestedEndDate.getTime() - requestedStartDate.getTime()) / (1000 * 60 * 60 * 24));

  try {
    // Chercher des créneaux libres dans les 60 prochains jours
    for (let i = 1; i <= 60; i++) {
      const testStart = new Date(requestedStartDate);
      testStart.setDate(testStart.getDate() + i);
      
      const testEnd = new Date(testStart);
      testEnd.setDate(testEnd.getDate() + duration);

      const testStartStr = testStart.toISOString().split('T')[0];
      const testEndStr = testEnd.toISOString().split('T')[0];

      // Vérifier la disponibilité pour cette période (confirmées et en attente)
      const { data: conflicts, error } = await supabase
        .from('reservations')
        .select('id')
        .eq('space_type', spaceType)
        .in('status', ['confirmed', 'pending'])
        .or(`and(start_date.lte.${testEndStr},end_date.gte.${testStartStr})`);

      if (!error && (conflicts?.length || 0) < maxCapacity) {
        suggestions.push({
          start: testStartStr,
          end: testEndStr
        });

        // Limiter à 5 suggestions
        if (suggestions.length >= 5) break;
      }
    }
  } catch (error) {
    console.error('❌ Error finding alternative dates:', error);
  }

  return suggestions;
};