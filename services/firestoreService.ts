import { doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Experience, User } from '../types';

type ExperienceData = Omit<Experience, 'id' | 'host' | 'rating' | 'imageUrl'>;

// --- USER-RELATED FUNCTIONS ---

/**
 * Creates a user profile document in the 'users' collection in Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @param name The user's name.
 * @param email The user's email.
 */
export const createUserProfile = async (uid: string, name: string, email: string): Promise<void> => {
  try {
    console.log('🔄 Creando referencia del documento de usuario:', uid);
    const userDocRef = doc(db, 'users', uid);
    
    console.log('🔄 Guardando documento en Firestore...');
    await setDoc(userDocRef, { name, email });
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
                const userProfile = {
                    id: uid,
                    name: data.name,
                    email: data.email
                } as User;
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