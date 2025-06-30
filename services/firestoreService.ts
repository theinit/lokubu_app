import { doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'; // Imports para Storage
import { db, storage } from '../firebase/config'; // Importar storage
import { Experience, User, Booking, BookingStatus, BookingMessage } from '../types';

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
    
    // Filtrar campos undefined para evitar errores de Firebase
    const cleanedData: Record<string, any> = {};
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedData[key] = value;
      }
    });
    
    console.log('🧹 Datos limpiados (sin undefined):', cleanedData);
    
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, cleanedData);
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

// --- BOOKING-RELATED FUNCTIONS ---

/**
 * Gets all booked time slots for a specific experience and date.
 * @param experienceId The experience ID.
 * @param date The date in YYYY-MM-DD format.
 * @returns A promise that resolves with an array of booked times.
 */
/**
 * Gets the total participants for a specific time slot.
 * @param experienceId The experience ID.
 * @param date The date in YYYY-MM-DD format.
 * @param time The time in HH:MM format.
 * @returns A promise that resolves with the total number of participants.
 */
export const getTimeSlotParticipants = async (experienceId: string, date: string, time: string): Promise<number> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('experienceId', '==', experienceId),
      where('date', '==', date),
      where('time', '==', time),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED])
    );
    
    const querySnapshot = await getDocs(q);
    let totalParticipants = 0;
    
    querySnapshot.forEach((doc) => {
      const booking = doc.data() as Booking;
      totalParticipants += booking.participants;
    });
    
    console.log(`🔍 Participantes para ${experienceId} el ${date} a las ${time}:`, totalParticipants);
    
    return totalParticipants;
  } catch (error) {
    console.error('❌ Error al obtener participantes del horario:', error);
    throw error;
  }
};

export const getBookedTimeSlots = async (experienceId: string, date: string): Promise<string[]> => {
  try {
    // Get the experience to know the max attendees
    const experienceDoc = await getDoc(doc(db, 'experiences', experienceId));
    if (!experienceDoc.exists()) {
      throw new Error('Experiencia no encontrada');
    }
    const experience = experienceDoc.data() as Experience;
    
    const bookingsRef = collection(db, 'bookings');
    const q = query(
      bookingsRef,
      where('experienceId', '==', experienceId),
      where('date', '==', date),
      where('status', 'in', [BookingStatus.PENDING, BookingStatus.CONFIRMED])
    );
    
    const querySnapshot = await getDocs(q);
    const timeSlotParticipants: { [time: string]: number } = {};
    
    querySnapshot.forEach((doc) => {
      const booking = doc.data() as Booking;
      if (!timeSlotParticipants[booking.time]) {
        timeSlotParticipants[booking.time] = 0;
      }
      timeSlotParticipants[booking.time] += booking.participants;
    });
    
    // Return times that have reached maximum capacity
    const fullyBookedTimes = Object.keys(timeSlotParticipants).filter(
      time => timeSlotParticipants[time] >= experience.maxAttendees
    );
    
    console.log(`🔍 Horarios completos para ${experienceId} el ${date}:`, fullyBookedTimes);
    
    return fullyBookedTimes;
  } catch (error) {
    console.error('❌ Error al obtener horarios reservados:', error);
    throw error;
  }
};

/**
 * Checks if a time slot has enough capacity for the requested number of participants.
 * @param experienceId The experience ID.
 * @param date The date in YYYY-MM-DD format.
 * @param time The time in HH:MM format.
 * @param requestedParticipants The number of participants to add.
 * @returns A promise that resolves with true if available, false otherwise.
 */
export const checkTimeSlotAvailability = async (experienceId: string, date: string, time: string, requestedParticipants: number = 1): Promise<boolean> => {
  try {
    // Get the experience to know the max attendees
    const experienceDoc = await getDoc(doc(db, 'experiences', experienceId));
    if (!experienceDoc.exists()) {
      throw new Error('Experiencia no encontrada');
    }
    const experience = experienceDoc.data() as Experience;
    
    // Get current participants for this time slot
    const currentParticipants = await getTimeSlotParticipants(experienceId, date, time);
    const availableSpots = experience.maxAttendees - currentParticipants;
    const isAvailable = availableSpots >= requestedParticipants;
    
    console.log(`🔍 Verificando disponibilidad para ${experienceId} el ${date} a las ${time}:`);
    console.log(`   - Máximo asistentes: ${experience.maxAttendees}`);
    console.log(`   - Participantes actuales: ${currentParticipants}`);
    console.log(`   - Plazas disponibles: ${availableSpots}`);
    console.log(`   - Participantes solicitados: ${requestedParticipants}`);
    console.log(`   - Resultado: ${isAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
    
    return isAvailable;
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error);
    throw error;
  }
};

/**
 * Creates a new booking in Firestore.
 * @param bookingData The booking data to create.
 * @returns A promise that resolves with the booking ID.
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // First, check if the time slot has enough capacity
    const isAvailable = await checkTimeSlotAvailability(bookingData.experienceId, bookingData.date, bookingData.time, bookingData.participants);
    
    if (!isAvailable) {
      throw new Error('No hay suficientes plazas disponibles para este horario. Por favor, selecciona otro horario o reduce el número de participantes.');
    }
    
    const bookingsRef = collection(db, 'bookings');
    const newBooking = {
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(bookingsRef, newBooking);
    console.log('✅ Reserva creada exitosamente:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    throw error;
  }
};

/**
 * Gets all bookings for a specific guest.
 * @param guestId The guest's user ID.
 * @returns A promise that resolves with an array of bookings.
 */
export const getGuestBookings = async (guestId: string): Promise<Booking[]> => {
  try {
    console.log('🔄 Consultando reservas para huésped:', guestId);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('guestId', '==', guestId), orderBy('createdAt', 'desc'));
    console.log('🔄 Ejecutando query de Firestore...');
    const querySnapshot = await getDocs(q);
    console.log('✅ Query ejecutada, documentos encontrados:', querySnapshot.size);
    
    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Procesando documento:', doc.id, data);
      bookings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Booking);
    });
    
    console.log('✅ Reservas procesadas:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error al obtener reservas del huésped:', error);
    throw error;
  }
};

/**
 * Gets all bookings for a specific host.
 * @param hostId The host's user ID.
 * @returns A promise that resolves with an array of bookings.
 */
export const getHostBookings = async (hostId: string): Promise<Booking[]> => {
  try {
    console.log('🔄 Consultando reservas para anfitrión:', hostId);
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('hostId', '==', hostId), orderBy('createdAt', 'desc'));
    console.log('🔄 Ejecutando query de Firestore...');
    const querySnapshot = await getDocs(q);
    console.log('✅ Query ejecutada, documentos encontrados:', querySnapshot.size);
    
    const bookings: Booking[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Procesando documento:', doc.id, data);
      bookings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Booking);
    });
    
    console.log('✅ Reservas procesadas:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error al obtener reservas del anfitrión:', error);
    throw error;
  }
};

/**
 * Updates a booking status.
 * @param bookingId The booking ID.
 * @param status The new status.
 * @param hostResponse Optional response message from host.
 * @returns A promise that resolves when the booking is updated.
 */
export const updateBookingStatus = async (bookingId: string, status: BookingStatus, hostResponse?: string): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (hostResponse) {
      updateData.hostResponse = hostResponse;
    }
    
    await updateDoc(bookingRef, updateData);
    console.log('✅ Estado de reserva actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar estado de reserva:', error);
    throw error;
  }
};

/**
 * Cancels a booking (sets status to cancelled).
 * @param bookingId The booking ID.
 * @returns A promise that resolves when the booking is cancelled.
 */
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await updateBookingStatus(bookingId, BookingStatus.CANCELLED);
    console.log('✅ Reserva cancelada exitosamente');
  } catch (error) {
    console.error('❌ Error al cancelar reserva:', error);
    throw error;
  }
};

/**
 * Gets the available spots for a specific time slot.
 * @param experienceId The experience ID.
 * @param date The date in YYYY-MM-DD format.
 * @param time The time in HH:MM format.
 * @returns A promise that resolves with the number of available spots.
 */
export const getAvailableSpots = async (experienceId: string, date: string, time: string): Promise<number> => {
  try {
    // Get the experience to know the max attendees
    const experienceDoc = await getDoc(doc(db, 'experiences', experienceId));
    if (!experienceDoc.exists()) {
      throw new Error('Experiencia no encontrada');
    }
    const experience = experienceDoc.data() as Experience;
    
    // Get current participants for this time slot
    const currentParticipants = await getTimeSlotParticipants(experienceId, date, time);
    const availableSpots = Math.max(0, experience.maxAttendees - currentParticipants);
    
    console.log(`🔍 Plazas disponibles para ${experienceId} el ${date} a las ${time}: ${availableSpots}/${experience.maxAttendees}`);
    
    return availableSpots;
  } catch (error) {
    console.error('❌ Error al obtener plazas disponibles:', error);
    throw error;
  }
};

/**
 * Gets a specific booking by ID.
 * @param bookingId The booking ID.
 * @returns A promise that resolves with the booking data.
 */
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    
    if (bookingSnap.exists()) {
      const data = bookingSnap.data();
      return {
        id: bookingSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Booking;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error al obtener reserva:', error);
    throw error;
  }
};

// --- BOOKING MESSAGES FUNCTIONS ---

/**
 * Sends a message related to a booking.
 * @param messageData The message data.
 * @returns A promise that resolves with the message ID.
 */
export const sendBookingMessage = async (messageData: Omit<BookingMessage, 'id' | 'timestamp'>): Promise<string> => {
  console.log('📤 Enviando mensaje:', { bookingId: messageData.bookingId, senderName: messageData.senderName, isFromHost: messageData.isFromHost });
  try {
    const messagesRef = collection(db, 'bookingMessages');
    const newMessage = {
      ...messageData,
      timestamp: new Date()
    };
    
    console.log('💾 Datos del mensaje a guardar:', newMessage);
    const docRef = await addDoc(messagesRef, newMessage);
    console.log('✅ Mensaje enviado exitosamente con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    throw error;
  }
};

/**
 * Gets all messages for a specific booking.
 * @param bookingId The booking ID.
 * @returns A promise that resolves with an array of messages.
 */
export const getBookingMessages = async (bookingId: string): Promise<BookingMessage[]> => {
  console.log('🔄 Cargando mensajes para reserva:', bookingId);
  try {
    const messagesRef = collection(db, 'bookingMessages');
    const q = query(messagesRef, where('bookingId', '==', bookingId), orderBy('timestamp', 'asc'));
    console.log('📋 Ejecutando consulta de mensajes...');
    const querySnapshot = await getDocs(q);
    console.log('📊 Documentos encontrados:', querySnapshot.size);
    
    const messages: BookingMessage[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('💬 Mensaje encontrado:', { id: doc.id, senderName: data.senderName, isFromHost: data.isFromHost });
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      } as BookingMessage);
    });
    
    console.log('✅ Total de mensajes cargados:', messages.length);
    return messages;
  } catch (error) {
    console.error('❌ Error al obtener mensajes de reserva:', error);
    throw error;
  }
};