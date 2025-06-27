import { doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Imports para Storage
import { db, storage } from '../firebase/config'; // Importar storage
import { Experience, User } from '../types';

type ExperienceData = Omit<Experience, 'id' | 'host' | 'rating' | 'imageUrl'>;

// --- USER-RELATED FUNCTIONS ---

/**
 * Creates a user profile document in the 'users' collection in Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @param name The user's name.
 * @param email The user's email.
 */
export const createUserProfile = async (uid: string, name: string, email: string, additionalData: Partial<User> = {}): Promise<void> => {
  try {
    console.log('🔄 Creando referencia del documento de usuario:', uid);
    const userDocRef = doc(db, 'users', uid);
    
    const userData = {
      name,
      email,
      ...additionalData,
    };

    console.log('🔄 Guardando documento en Firestore...');
    await setDoc(userDocRef, userData);
    console.log('✅ Documento de usuario guardado exitosamente en Firestore');
  } catch (error: any) {
    console.error('❌ Error al crear perfil de usuario en Firestore:', error);
    
    // Manejo específico de errores comunes
    if (error.code === 'permission-denied') {
      console.error('🚫 Error de permisos: Verifica las reglas de Firestore');
      console.error('💡 Solución: Ve a Firebase Console → Firestore → Reglas y configura permisos para usuarios autenticados');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Error de conexión: Firestore no está disponible');
      console.error('💡 Solución: Verifica tu conexión a internet y deshabilita bloqueadores de anuncios');
    } else if (error.message?.includes('400')) {
      console.error('🔧 Error 400: Solicitud incorrecta a Firestore');
      console.error('💡 Solución: Verifica las reglas de Firestore y la configuración del proyecto');
    }
    
    throw error;
  }
};

/**
 * Deletes a user profile document from the 'users' collection in Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 */
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    console.log('🔄 Eliminando perfil de usuario de Firestore:', uid);
    const userDocRef = doc(db, 'users', uid);
    
    await deleteDoc(userDocRef);
    console.log('✅ Perfil de usuario eliminado exitosamente de Firestore');
  } catch (error: any) {
    console.error('❌ Error al eliminar perfil de usuario de Firestore:', error);
    
    // Manejo específico de errores comunes
    if (error.code === 'permission-denied') {
      console.error('🚫 Error de permisos al eliminar: Verifica las reglas de Firestore');
      console.error('💡 Solución: Asegúrate de que las reglas permitan eliminación para el usuario autenticado');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Error de conexión al eliminar: Firestore no está disponible');
      console.error('💡 Solución: Verifica conexión a internet y deshabilita bloqueadores de anuncios');
    } else if (error.message?.includes('400')) {
      console.error('🔧 Error 400 al eliminar: Solicitud incorrecta a Firestore');
      console.error('💡 Solución: Verifica las reglas de Firestore y la configuración del proyecto');
    }
    
    throw error;
  }
};

/**
 * Retrieves a user profile from Firestore based on their UID.
 * @param uid The user's unique ID.
 * @returns A User object or null if not found.
 */
export const getUserProfile = async (uid:string): Promise<User | null> => {
    try {
        console.log('🔄 Obteniendo perfil de usuario desde Firestore:', uid);
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if(userDocSnap.exists()) {
            console.log('✅ Documento de usuario encontrado en Firestore');
            const data = userDocSnap.data();
            if (data) {
                const userProfile: User = {
                    id: uid,
                    name: data.name,
                    email: data.email,
                    lastName: data.lastName,
                    hobbies: data.hobbies,
                    age: data.age,
                    photoURL: data.photoURL,
                };
                // Remove undefined fields to match the User interface strictly if needed
                // Object.keys(userProfile).forEach(key => userProfile[key] === undefined && delete userProfile[key]);
                console.log('✅ Perfil de usuario procesado:', userProfile);
                return userProfile;
            }
        } else {
            console.log('⚠️ No se encontró documento de usuario en Firestore');
        }
        return null;
    } catch (error: any) {
        console.error('❌ Error al obtener perfil de usuario desde Firestore:', error);
        
        // Manejo específico de errores comunes
        if (error.code === 'permission-denied') {
            console.error('🚫 Error de permisos al leer usuario: Verifica las reglas de Firestore');
            console.error('💡 Solución: Asegúrate de que el usuario esté autenticado y las reglas permitan lectura');
        } else if (error.code === 'unavailable') {
            console.error('🌐 Error de conexión al leer usuario: Firestore no está disponible');
            console.error('💡 Solución: Verifica conexión a internet y deshabilita bloqueadores de anuncios');
        } else if (error.message?.includes('400')) {
            console.error('🔧 Error 400 al leer usuario: Solicitud incorrecta a Firestore');
            console.error('💡 Solución: Verifica las reglas de Firestore y la configuración del proyecto');
        }
        
        return null;
    }
}

/**
 * Updates a user profile document in Firestore.
 * @param uid The user's unique ID.
 * @param updatedData An object containing the fields to update.
 */
export const updateUserProfile = async (uid: string, updatedData: Partial<User>): Promise<void> => {
  try {
    console.log('🔄 Actualizando perfil de usuario en Firestore:', uid, updatedData);
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updatedData);
    console.log('✅ Perfil de usuario actualizado exitosamente en Firestore');
  } catch (error: any) {
    console.error('❌ Error al actualizar perfil de usuario en Firestore:', error);
    if (error.code === 'permission-denied') {
      console.error('🚫 Error de permisos al actualizar: Verifica las reglas de Firestore');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Error de conexión al actualizar: Firestore no está disponible');
    }
    throw error;
  }
};

/**
 * Uploads a profile image to Firebase Storage.
 * @param userId The user's ID, used to create a unique path for the image.
 * @param file The image file to upload.
 * @param currentPhotoURL Optional. The URL of the current profile photo to be deleted.
 * @returns A promise that resolves to the download URL of the uploaded image.
 */
export const uploadProfileImage = async (userId: string, file: File, currentPhotoURL?: string): Promise<string> => {
  try {
    console.log('🔄 Iniciando subida de imagen de perfil...');
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB permitido.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP.');
    }

    // 1. Upload the new image first
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const imageName = `${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, `profile_images/${userId}/${imageName}`);

    console.log(`🔄 Subiendo imagen a: profile_images/${userId}/${imageName}`);
    
    // Upload with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('✅ Imagen subida exitosamente:', snapshot.metadata.fullPath);

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ URL de descarga obtenida:', downloadURL);

    // 2. Delete the old image after successful upload
    if (currentPhotoURL && currentPhotoURL.includes('firebasestorage.googleapis.com')) {
      try {
        // Extract the storage path from the download URL
        const url = new URL(currentPhotoURL);
        const pathMatch = url.pathname.match(/\/o\/(.*?)\?/);
        if (pathMatch && pathMatch[1]) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          const oldImageRef = ref(storage, storagePath);
          await deleteObject(oldImageRef);
          console.log('✅ Antigua imagen eliminada:', storagePath);
        }
      } catch (deleteError: any) {
        // Don't fail the entire operation if old image deletion fails
        console.warn('⚠️ No se pudo eliminar la imagen anterior:', deleteError.message);
      }
    }

    return downloadURL;
  } catch (error: any) {
    console.error('❌ Error al subir imagen de perfil:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('No tienes permisos para subir imágenes. Verifica las reglas de Firebase Storage.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('La subida fue cancelada.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Error desconocido al subir la imagen. Intenta nuevamente.');
    }
    
    throw error;
  }
};


// --- EXPERIENCE-RELATED FUNCTIONS ---

/**
 * Fetches all experience documents from the 'experiences' collection.
 * @returns A promise that resolves to an array of Experience objects.
 */
export const getExperiences = async (): Promise<Experience[]> => {
  const experiencesCol = collection(db, 'experiences');
  const experiencesSnapshot = await getDocs(experiencesCol);
  const experiencesList = experiencesSnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as Experience;
  });
  return experiencesList;
};

/**
 * Creates a new experience document in Firestore.
 * @param experienceData The data for the new experience from the creation form.
 * @param host The user object for the host creating the experience.
 * @returns A promise that resolves to the newly created Experience object.
 */
export const createExperience = async (experienceData: ExperienceData, host: User): Promise<Experience> => {
    const newExperienceDocData = {
      ...experienceData,
      host: {
        id: host.id,
        name: host.name,
        avatarUrl: `https://i.pravatar.cc/150?u=${host.id}`,
        rating: 0, // Host rating can be calculated later
      },
      rating: 0, // New experiences start with 0 rating
      imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`,
    };
  
    const docRef = await addDoc(collection(db, "experiences"), newExperienceDocData);
    
    return {
        id: docRef.id,
        ...newExperienceDocData
    } as Experience;
  };

/**
 * Updates an existing experience in Firestore.
 * @param experienceId The ID of the experience to update.
 * @param experienceData The updated experience data.
 * @returns A promise that resolves when the experience is updated.
 */
export const updateExperience = async (experienceId: string, experienceData: Partial<Experience>): Promise<void> => {
  const experienceRef = doc(db, "experiences", experienceId);
  await updateDoc(experienceRef, experienceData);
};

/**
 * Deletes an experience from Firestore.
 * @param experienceId The ID of the experience to delete.
 * @returns A promise that resolves when the experience is deleted.
 */
export const deleteExperience = async (experienceId: string): Promise<void> => {
  const experienceRef = doc(db, "experiences", experienceId);
  await deleteDoc(experienceRef);
};