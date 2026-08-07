import { supabase } from './supabase';

const BUCKET = 'pending-media';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

function extFor(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

// Carica le foto nel bucket privato `pending-media` e restituisce i percorsi.
// L'anonimo può solo scrivere (policy `pending_insert_anon`), mai rileggere.
export async function uploadPendingMedia(files: File[]): Promise<string[]> {
  const paths: string[] = [];
  for (const file of files) {
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error('Formato non supportato. Usa JPEG, PNG o WebP.');
    }
    if (file.size > MAX_BYTES) {
      throw new Error('Ogni foto deve pesare al massimo 5 MB.');
    }
    const path = `${crypto.randomUUID()}.${extFor(file.type)}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}
