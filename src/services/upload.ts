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

// Faz upload de um logo para o bucket 'branding' e retorna a URL pública
export async function uploadLogoToSupabase(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `logo-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Tentar fazer upload no bucket 'branding'
  const { error } = await supabase.storage.from('branding').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true, // Permite sobrescrever se já existir
  });

  if (error) {
    // Se o bucket não existir, usar o bucket de propriedades como fallback
    return uploadImageToSupabase(file);
  }

  // Gerar URL pública
  const { data } = supabase.storage.from('branding').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública da imagem');
  return data.publicUrl;
} 