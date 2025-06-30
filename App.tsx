import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExperienceCard from './components/ExperienceCard';
import SearchBar from './components/SearchBar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import EditProfileModal from './components/EditProfileModal'; // Importar el nuevo modal
import CreateExperience from './components/CreateExperience';
import EditExperience from './components/EditExperience';
import MyExperiences from './components/MyExperiences';
import ExperienceDetail from './components/ExperienceDetail';
import MapComponent from './components/MapComponent';
import HomePage from './components/HomePage';
import MyBookings from './components/MyBookings';
import HostBookings from './components/HostBookings';
import { getExperiences, createExperience as apiCreateExperience, updateExperience, deleteExperience } from './services/firestoreService';
import { Experience, ExperienceCategory, AppView } from './types';
import { useAuth } from './contexts/AuthContext';
import { useI18n } from './contexts/I18nContext';

type ActiveModal = 'login' | 'register' | null;

const App: React.FC = () => {
  const { t } = useI18n();
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
    // Recuperar vista del localStorage, pero solo si hay filtros activos
    const savedLocation = localStorage.getItem('lokubu-location-filter');
    const savedView = localStorage.getItem('lokubu-current-view') as AppView;
    if (savedLocation && savedView === 'home') {
      return 'home';
    }
    return 'landing';
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
      if (newView === 'home') {
          setSelectedExperience(null);
          setEditingExperience(null);
      }
      // Si navegamos a landing, limpiar filtros
      if (newView === 'landing') {
          setLocationFilter('');
          setCategoryFilter(ExperienceCategory.ALL);
          localStorage.removeItem('lokubu-location-filter');
          localStorage.removeItem('lokubu-category-filter');
          localStorage.removeItem('lokubu-current-view');
      }
      setView(newView);
  }, []);

  const handleStartEditExperience = useCallback((experience: Experience) => {
    setEditingExperience(experience);
    setView('edit');
  }, []);

  const handleSearch = useCallback((location: string) => {
    setLocationFilter(location);
    setView('home');
  }, []);

  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => {
      const matchesLocation = exp.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesCategory = categoryFilter === ExperienceCategory.ALL || exp.category === categoryFilter;
      return matchesLocation && matchesCategory;
    });
  }, [experiences, locationFilter, categoryFilter]);
  
  const renderHomeView = () => (
    <>
      <div className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">{t('home.mapTitle')}</h2>
        <p className="text-xl text-gray-300 mb-6">{t('home.mapSubtitle')}</p>
        <div className="h-[500px] w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-12 relative z-0">
            <MapComponent experiences={filteredExperiences} onViewExperience={handleViewExperience} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">{t('home.exploreTitle')}</h2>
        <p className="text-xl text-gray-300 mb-6">{t('home.exploreSubtitle')}</p>
        <SearchBar 
          locationFilter={locationFilter}
          categoryFilter={categoryFilter}
          onLocationChange={setLocationFilter}
          onCategoryChange={setCategoryFilter}
        />
      </div>

      {isLoadingExperiences ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-200">{t('common.loading')}</h3>
          </div>
      ) : errorExperiences ? (
          <div className="text-center py-16 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-xl font-semibold text-red-300">{t('home.errorTitle')}</h3>
            <p className="text-red-400 mt-2">{errorExperiences}</p>
          </div>
      ) : filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredExperiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} onViewExperience={handleViewExperience}/>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-gray-200">{t('home.noExperiences')}</h3>
          <p className="text-gray-400 mt-2">{t('home.noExperiencesSubtitle')}</p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (view) {
      case 'landing':
        return (
          <HomePage 
            onSearch={handleSearch}
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
        ) : renderHomeView();
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
        return selectedExperience ? <ExperienceDetail experience={selectedExperience} onBack={() => handleNavigate(currentUser ? 'home' : 'landing')} /> : renderHomeView();
      case 'home':
      default:
        return renderHomeView();
    }
  };

  if (view === 'landing') {
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
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header 
            onLoginClick={() => setActiveModal('login')}
            onRegisterClick={() => setActiveModal('register')}
            onNavigate={handleNavigate}
            onOpenEditProfile={() => setIsEditProfileModalOpen(true)} // Pasar la función para abrir el modal
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
      {currentUser && ( // Solo renderizar si hay un usuario logueado
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          onProfileUpdate={(updatedUser) => {
            setCurrentUser(updatedUser); // Actualizar el usuario en el contexto global
            setIsEditProfileModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default App;