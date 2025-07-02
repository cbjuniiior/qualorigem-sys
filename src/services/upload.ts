import { supabase } from "@/integrations/supabase/client";

// Faz upload de uma imagem para o bucket 'propriedades' e retorna a URL pública
export async function uploadImageToSupabase(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage.from('propriedades').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  // Gerar URL pública
  const { data } = supabase.storage.from('propriedades').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública da imagem');
  return data.publicUrl;
} 