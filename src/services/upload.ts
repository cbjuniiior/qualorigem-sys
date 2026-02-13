import { supabase } from "@/integrations/supabase/client";

/**
 * Redimensiona uma imagem para uma largura máxima mantendo a proporção
 */
async function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Erro ao converter canvas para blob'));
            }
          },
          file.type,
          0.8 // Qualidade 80%
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Faz upload de uma imagem para um bucket (padrão 'propriedades') e retorna a URL pública
export async function uploadImageToSupabase(file: File, bucketName: string = 'propriedades'): Promise<string> {
  let fileToUpload: File | Blob = file;

  // Redimensionar se for imagem e maior que 500px
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await resizeImage(file, 500);
    } catch (error) {
      console.warn('Erro ao redimensionar imagem, enviando original:', error);
      fileToUpload = file;
    }
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage.from(bucketName).upload(filePath, fileToUpload, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type // Importante para manter o tipo correto após conversão em Blob
  });
  if (error) throw error;

  // Gerar URL pública
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública da imagem');
  return data.publicUrl;
}

// Faz upload de um logo para o bucket 'branding' e retorna a URL pública
export async function uploadLogoToSupabase(file: File): Promise<string> {
  let fileToUpload: File | Blob = file;

  // Redimensionar se for imagem e maior que 500px
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await resizeImage(file, 500);
    } catch (error) {
      console.warn('Erro ao redimensionar logo, enviando original:', error);
      fileToUpload = file;
    }
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `logo-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Tentar fazer upload no bucket 'branding'
  const { error } = await supabase.storage.from('branding').upload(filePath, fileToUpload, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type
  });

  if (error) {
    console.error('Erro no upload branding:', error);
    // Se falhar (ex: bucket não existe ou erro 400), tentar no bucket 'propriedades'
    return uploadImageToSupabase(file);
  }

  // Gerar URL pública
  const { data } = supabase.storage.from('branding').getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública da imagem');
  return data.publicUrl;
}

/** Upload de favicon da plataforma (painel Super Admin) - bucket branding, prefixo platform/ */
export async function uploadPlatformFaviconToSupabase(file: File): Promise<string> {
  let fileToUpload: File | Blob = file;
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await resizeImage(file, 256);
    } catch {
      fileToUpload = file;
    }
  }
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `platform/favicon-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('branding').upload(fileName, fileToUpload, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('branding').getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública do favicon');
  return data.publicUrl;
}

/** Upload da imagem OG (redes sociais / compartilhamento) - bucket branding, prefixo platform/ */
export async function uploadPlatformOgImageToSupabase(file: File): Promise<string> {
  let fileToUpload: File | Blob = file;
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await resizeImage(file, 1200);
    } catch {
      fileToUpload = file;
    }
  }
  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `platform/og-image-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('branding').upload(fileName, fileToUpload, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('branding').getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública da imagem OG');
  return data.publicUrl;
}

// Faz upload de um PDF para o bucket 'certificados' e retorna a URL pública
export async function uploadCertificateToSupabase(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    throw new Error('Apenas arquivos PDF são aceitos para certificações');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('O arquivo PDF deve ter no máximo 10MB');
  }

  const fileName = `cert-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.pdf`;

  const { error } = await supabase.storage.from('certificados').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'application/pdf'
  });

  if (error) {
    console.error('Erro no upload certificado:', error);
    throw error;
  }

  const { data } = supabase.storage.from('certificados').getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Erro ao obter URL pública do certificado');
  return data.publicUrl;
}