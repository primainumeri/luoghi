import { supabase } from './supabase';
import type { PlaceType, PublicStatus } from './types';

export interface QueueItem {
  id: string;
  title: string;
  description: string;
  type: PlaceType;
  category_id: string;
  proposal: string | null;
  location_label: string | null;
  created_at: string;
}

// Coda privata delle segnalazioni ricevute (visibile solo ai moderatori via RLS).
export async function fetchQueue(): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, title, description, type, category_id, proposal, location_label, created_at')
    .eq('internal_status', 'ricevuta')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as QueueItem[];
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc('reject_submission', {
    p_submission_id: id,
    p_reason: reason,
  });
  if (error) throw error;
}

export interface PublishInput {
  submissionId: string;
  title: string;
  summary?: string;
  description?: string;
  proposal?: string;
  publicStatus: PublicStatus;
}

export async function publishSubmission(input: PublishInput): Promise<string> {
  const { data, error } = await supabase.rpc('publish_submission', {
    p_submission_id: input.submissionId,
    p_title: input.title,
    p_summary: input.summary ?? null,
    p_description: input.description ?? null,
    p_proposal: input.proposal ?? null,
    p_public_status: input.publicStatus,
  });
  if (error) throw error;
  return data as string;
}

export async function setPlaceStatus(
  placeId: string,
  status: PublicStatus,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc('set_place_status', {
    p_place_id: placeId,
    p_status: status,
    p_note: note ?? null,
  });
  if (error) throw error;
}
