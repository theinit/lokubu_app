import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile, deleteUserProfile } from './firestoreService';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<void> => {
    console.log('🔄 Iniciando registro de usuario...');
    
    try {
      console.log('🔄 Creando usuario en Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Usuario creado en Firebase Auth:', user.uid);

      if (!user) {
        throw new Error("Failed to create user.");
      }
      
      // Update Firebase Auth profile's display name
      console.log('🔄 Actualizando perfil de usuario...');
      await updateProfile(user, { displayName: name });
      console.log('✅ Perfil de usuario actualizado');
      
      // Create a corresponding user profile document in Firestore
      console.log('🔄 Creando documento de usuario en Firestore...');
      await createUserProfile(user.uid, name, user.email!);
      console.log('✅ Documento de usuario creado en Firestore');
      
      console.log('✅ Registro completado exitosamente');
    } catch (error) {
      console.error('❌ Error durante el registro:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  deleteAccount: async (password: string): Promise<void> => {
    console.log('🔄 Iniciando eliminación de cuenta...');
    
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No hay usuario autenticado para eliminar');
    }
    
    try {
      // Reautenticar al usuario antes de eliminar la cuenta
      console.log('🔄 Reautenticando usuario...');
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ Usuario reautenticado exitosamente');
      
      // Primero eliminar datos del usuario en Firestore
      console.log('🔄 Eliminando datos del usuario en Firestore...');
      await deleteUserProfile(user.uid);
      console.log('✅ Datos del usuario eliminados de Firestore');
      
      // Luego eliminar la cuenta de Firebase Auth
      console.log('🔄 Eliminando cuenta de Firebase Auth...');
      await deleteUser(user);
      console.log('✅ Cuenta eliminada exitosamente de Firebase Auth');
      
      console.log('✅ Eliminación de cuenta completada exitosamente');
    } catch (error) {
      console.error('❌ Error durante la eliminación de cuenta:', error);
      throw error;
    }
  },
};