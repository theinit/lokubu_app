import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import EditProfileModal from './components/EditProfileModal';
import CreateExperience from './components/CreateExperience';
import EditExperience from './components/EditExperience';
import MyExperiences from './components/MyExperiences';
import ExperienceDetail from './components/ExperienceDetail';
import MainPage from './components/MainPage';
import MyBookings from './components/MyBookings';
import HostBookings from './components/HostBookings';
import { getExperiences, createExperience as apiCreateExperience, updateExperience, deleteExperience } from './services/firestoreService';
import { Experience, ExperienceCategory, AppView } from './types';
import { useAuth } from './contexts/AuthContext';
// import { useI18n } from './contexts/I18nContext'; // Comentado temporalmente

type ActiveModal = 'login' | 'register' | null;

const App: React.FC = () => {
  // const { t } = useI18n(); // Comentado temporalmente
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [errorExperiences, setErrorExperiences] = useState<string | null>(null);
  
  const [locationFilter, setLocationFilter] = useState(() => {
    // Recuperar filtro de ubicación del localStorage
    return localStorage.getItem('lokubu-location-filter') || '';
  });
  const [categoryFilter, setCategoryFilter] = useState<ExperienceCategory>(() => {
    // Recuperar filtro de categoría del localStorage
    const saved = localStorage.getItem('lokubu-category-filter');
    return (saved as ExperienceCategory) || ExperienceCategory.ALL;
  });
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [view, setView] = useState<AppView>(() => {
    // Recuperar vista del localStorage, por defecto 'main'
    const savedView = localStorage.getItem('lokubu-current-view') as AppView;
    return savedView && savedView !== 'main' ? savedView : 'main';
  });
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); // Estado para el modal de edición de perfil
  const { currentUser, setCurrentUser } = useAuth(); // Obtener setCurrentUser del contexto

  useEffect(() => {
    const fetchExperiences = async () => {
        try {
            setIsLoadingExperiences(true);
            setErrorExperiences(null);
            const fetchedExperiences = await getExperiences();
            setExperiences(fetchedExperiences);
        } catch (error) {
            console.error("Failed to fetch experiences:", error);
            setErrorExperiences("Could not load experiences. Please try again later.");
        } finally {
            setIsLoadingExperiences(false);
        }
    };

    fetchExperiences();
  }, []);

  // Persistir filtros en localStorage
  useEffect(() => {
    if (locationFilter) {
      localStorage.setItem('lokubu-location-filter', locationFilter);
    } else {
      localStorage.removeItem('lokubu-location-filter');
    }
  }, [locationFilter]);

  useEffect(() => {
    localStorage.setItem('lokubu-category-filter', categoryFilter);
  }, [categoryFilter]);

  // Persistir vista actual en localStorage
  useEffect(() => {
    localStorage.setItem('lokubu-current-view', view);
  }, [view]);

  // Cambiar automáticamente a 'main' cuando se desloguea
  useEffect(() => {
    if (!currentUser && view !== 'main') {
      setView('main');
    }
  }, [currentUser, view]);

  const handleCreateExperience = useCallback(async (newExpData: Omit<Experience, 'id' | 'host' | 'rating' | 'imageUrl'>) => {
    if (!currentUser) {
        alert("You must be logged in to create an experience.");
        return;
    }

    try {
        const newExperience = await apiCreateExperience(newExpData, currentUser);
        setExperiences(prev => [newExperience, ...prev]);
        setView('my-experiences');
    } catch (error) {
        console.error("Failed to create experience:", error);
        alert("There was an error creating your experience. Please try again.");
    }
  }, [currentUser]);

  const handleEditExperience = useCallback(async (experienceId: string, updatedData: Partial<Experience>) => {
    if (!currentUser) {
        alert("Debes estar logueado para editar una experiencia.");
        return;
    }

    try {
        await updateExperience(experienceId, updatedData);
        setExperiences(prev => prev.map(exp => 
            exp.id === experienceId ? { ...exp, ...updatedData } : exp
        ));
        setView('my-experiences');
    } catch (error) {
        console.error("Failed to update experience:", error);
        alert("Hubo un error al actualizar tu experiencia. Por favor intenta de nuevo.");
    }
  }, [currentUser]);

  const handleDeleteExperience = useCallback(async (experienceId: string) => {
    if (!currentUser) {
        alert("Debes estar logueado para eliminar una experiencia.");
        return;
    }

    try {
        await deleteExperience(experienceId);
        setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
    } catch (error) {
        console.error("Failed to delete experience:", error);
        alert("Hubo un error al eliminar tu experiencia. Por favor intenta de nuevo.");
    }
  }, [currentUser]);

  const handleViewExperience = useCallback((experience: Experience) => {
    setSelectedExperience(experience);
    setView('detail');
  }, []);

  const handleNavigate = useCallback((newView: AppView) => {
      if (newView === 'main') {
          setSelectedExperience(null);
          setEditingExperience(null);
      }
      setView(newView);
  }, []);

  const handleStartEditExperience = useCallback((experience: Experience) => {
    setEditingExperience(experience);
    setView('edit');
  }, []);

  // const handleSearch = useCallback((location: string) => {
  //   setLocationFilter(location);
  //   handleNavigate('main');
  // }, [handleNavigate]); // Comentado temporalmente

  // const filteredExperiences = useMemo(() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  //   
  //   return experiences.filter(exp => {
  //     const matchesLocation = exp.location.toLowerCase().includes(locationFilter.toLowerCase());
  //     const matchesCategory = categoryFilter === ExperienceCategory.ALL || exp.category === categoryFilter;
  //     
  //     // Check if experience has available dates from today onwards
  //     const hasAvailableDates = Object.keys(exp.availability || {}).some(dateStr => {
  //       const availableDate = new Date(dateStr);
  //       return availableDate >= today;
  //     });
  //     
  //     return matchesLocation && matchesCategory && hasAvailableDates;
  //   });
  // }, [experiences, locationFilter, categoryFilter]); // Comentado temporalmente
  


  const renderContent = () => {
    switch (view) {
      case 'main':
        return (
          <MainPage
            experiences={experiences}
            isLoadingExperiences={isLoadingExperiences}
            errorExperiences={errorExperiences}
            locationFilter={locationFilter}
            categoryFilter={categoryFilter}
            onLocationChange={setLocationFilter}
            onCategoryChange={setCategoryFilter}
            onViewExperience={handleViewExperience}
            onOpenLogin={() => setActiveModal('login')}
            onOpenRegister={() => setActiveModal('register')}
          />
        );
      case 'create':
        return <CreateExperience onSubmit={handleCreateExperience} onBack={() => handleNavigate('my-experiences')} />;
      case 'edit':
        return editingExperience ? (
          <EditExperience 
            experience={editingExperience} 
            onSubmit={(updatedData) => handleEditExperience(editingExperience.id, updatedData)} 
            onBack={() => handleNavigate('my-experiences')} 
          />
        ) : (
          <MainPage
            experiences={experiences}
            isLoadingExperiences={isLoadingExperiences}
            errorExperiences={errorExperiences}
            locationFilter={locationFilter}
            categoryFilter={categoryFilter}
            onLocationChange={setLocationFilter}
            onCategoryChange={setCategoryFilter}
            onViewExperience={handleViewExperience}
            onOpenLogin={() => setActiveModal('login')}
            onOpenRegister={() => setActiveModal('register')}
          />
        );
      case 'my-experiences':
        return (
          <MyExperiences 
            allExperiences={experiences} 
            onNavigate={handleNavigate} 
            onViewExperience={handleViewExperience}
            onEditExperience={handleStartEditExperience}
            onDeleteExperience={handleDeleteExperience}
          />
        );
      case 'bookings':
        return <MyBookings />;
      case 'host-bookings':
        return <HostBookings />;
      case 'detail':
        return selectedExperience ? <ExperienceDetail experience={selectedExperience} onBack={() => handleNavigate('main')} /> : (
          <MainPage
            experiences={experiences}
            isLoadingExperiences={isLoadingExperiences}
            errorExperiences={errorExperiences}
            locationFilter={locationFilter}
            categoryFilter={categoryFilter}
            onLocationChange={setLocationFilter}
            onCategoryChange={setCategoryFilter}
            onViewExperience={handleViewExperience}
            onOpenLogin={() => setActiveModal('login')}
            onOpenRegister={() => setActiveModal('register')}
          />
        );
      default:
        return (
          <MainPage
            experiences={experiences}
            isLoadingExperiences={isLoadingExperiences}
            errorExperiences={errorExperiences}
            locationFilter={locationFilter}
            categoryFilter={categoryFilter}
            onLocationChange={setLocationFilter}
            onCategoryChange={setCategoryFilter}
            onViewExperience={handleViewExperience}
            onOpenLogin={() => setActiveModal('login')}
            onOpenRegister={() => setActiveModal('register')}
          />
        );
    }
  };

  // Para la vista 'main', mostrar Header/Footer solo cuando hay filtros activos o usuario logueado
  if (view === 'main') {
    const hasActiveFilters = locationFilter || categoryFilter !== ExperienceCategory.ALL;
    const shouldShowHeaderFooter = currentUser || hasActiveFilters;
    
    if (shouldShowHeaderFooter) {
      return (
        <>
          <div className="flex flex-col min-h-screen bg-gray-900">
            <Header 
                onLoginClick={() => setActiveModal('login')}
                onRegisterClick={() => setActiveModal('register')}
                onNavigate={handleNavigate}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
            />
            <main className="flex-grow">
              {renderContent()}
            </main>
            <Footer />
          </div>
          <LoginModal 
            isOpen={activeModal === 'login'}
            onClose={() => setActiveModal(null)}
            onSwitchToRegister={() => setActiveModal('register')}
          />
          <RegisterModal
            isOpen={activeModal === 'register'}
            onClose={() => setActiveModal(null)}
            onSwitchToLogin={() => setActiveModal('login')}
          />
          {currentUser && (
            <EditProfileModal
              isOpen={isEditProfileModalOpen}
              onClose={() => setIsEditProfileModalOpen(false)}
              onProfileUpdate={(updatedUser) => {
                setCurrentUser(updatedUser);
                setIsEditProfileModalOpen(false);
              }}
            />
          )}
        </>
      );
    } else {
      // Vista completa sin header/footer para usuarios no logueados sin filtros
      return (
        <>
          {renderContent()}
          <LoginModal 
            isOpen={activeModal === 'login'}
            onClose={() => setActiveModal(null)}
            onSwitchToRegister={() => setActiveModal('register')}
          />
          <RegisterModal
            isOpen={activeModal === 'register'}
            onClose={() => setActiveModal(null)}
            onSwitchToLogin={() => setActiveModal('login')}
          />
          {currentUser && (
            <EditProfileModal
              isOpen={isEditProfileModalOpen}
              onClose={() => setIsEditProfileModalOpen(false)}
              onProfileUpdate={(updatedUser) => {
                setCurrentUser(updatedUser);
                setIsEditProfileModalOpen(false);
              }}
            />
          )}
        </>
      );
    }
  }

  // Para otras vistas, usar la estructura tradicional con Header/Footer
  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header 
            onLoginClick={() => setActiveModal('login')}
            onRegisterClick={() => setActiveModal('register')}
            onNavigate={handleNavigate}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {renderContent()}
        </main>
        <Footer />
      </div>

      <LoginModal 
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal(null)}
        onSwitchToRegister={() => setActiveModal('register')}
      />
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={() => setActiveModal(null)}
        onSwitchToLogin={() => setActiveModal('login')}
      />
      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onProfileUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            setIsEditProfileModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default App;