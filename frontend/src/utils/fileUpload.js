import { supabase } from './supabaseClient';

/**
 * Upload un fichier vers Supabase Storage
 * @param {File} file - Le fichier à uploader
 * @param {string} bucket - Le bucket de destination
 * @param {string} path - Le chemin dans le bucket
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadFile = async (file, bucket, path) => {
  try {
    console.log('[UPLOAD] Début upload:', { fileName: file.name, bucket, path });
    
    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux (max 5MB)');
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé (JPG, PNG uniquement)');
    }

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[UPLOAD] Erreur upload:', error);
      throw error;
    }

    // Générer l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    console.log('[UPLOAD] ✅ Upload réussi:', urlData.publicUrl);
    
    return {
      success: true,
      url: urlData.publicUrl,
      path: path
    };
  } catch (error) {
    console.error('[UPLOAD] ❌ Erreur upload:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload une carte d'identité utilisateur
 * @param {File} file - Le fichier de la carte d'identité
 * @param {string} userId - L'ID de l'utilisateur
 * @param {string} type - Le type (user ou temoin)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadIdentityCard = async (file, userId, type = 'user') => {
  const timestamp = Date.now();
  const fileName = `${type}_identity_${userId}_${timestamp}.${file.name.split('.').pop()}`;
  const path = `identity-cards/${userId}/${fileName}`;
  
  return await uploadFile(file, 'documents', path);
};

/**
 * Supprimer un fichier de Supabase Storage
 * @param {string} bucket - Le bucket
 * @param {string} path - Le chemin du fichier
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('[DELETE] Erreur suppression:', error);
      throw error;
    }

    console.log('[DELETE] ✅ Fichier supprimé:', path);
    return { success: true };
  } catch (error) {
    console.error('[DELETE] ❌ Erreur suppression:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
