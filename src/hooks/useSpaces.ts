import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Space {
  id: string;
  name: string;
  type: string;
  description: string;
  prix_journalier: number;
  prix_mensuel: number;
  prix_annuel: number;
  nombre_occupants: number;
  photo_espace?: string;
  is_active: boolean;
  features?: string[];
  images?: string[];
  availability_status?: string;
  display_order?: number;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des espaces:', error);
        setError('Erreur lors du chargement des espaces');
        return;
      }

      setSpaces(data || []);
    } catch (err) {
      console.error('Erreur inattendue:', err);
      setError('Erreur inattendue lors du chargement des espaces');
    } finally {
      setLoading(false);
    }
  };

  const createSpace = async (spaceData: Partial<Space>) => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert(spaceData)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'espace:', error);
        throw error;
      }

      setSpaces(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      throw err;
    }
  };

  const updateSpace = async (id: string, updates: Partial<Space>) => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'espace:', error);
        throw error;
      }

      setSpaces(prev => prev.map(space => space.id === id ? data : space));
      return data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  };

  const deleteSpace = async (id: string) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'espace:', error);
        throw error;
      }

      setSpaces(prev => prev.filter(space => space.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('spaces')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erreur lors du test de connexion:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  return {
    spaces,
    loading,
    error,
    fetchSpaces,
    createSpace,
    updateSpace,
    deleteSpace,
    testSupabaseConnection
  };
};