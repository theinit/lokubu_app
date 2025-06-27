import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ExperienceCard from './components/ExperienceCard';
import SearchBar from './components/SearchBar';
import AITravelPlanner from './components/AITravelPlanner';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CreateExperience from './components/CreateExperience';
import EditExperience from './components/EditExperience';
import MyExperiences from './components/MyExperiences';
import ExperienceDetail from './components/ExperienceDetail';
import MapComponent from './components/MapComponent';
import { getExperiences, createExperience as apiCreateExperience, updateExperience, deleteExperience } from './services/firestoreService';
import { Experience, ExperienceCategory, AppView } from './types';
import { useAuth } from './contexts/AuthContext';

type ActiveModal = 'login' | 'register' | null;

const App: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [errorExperiences, setErrorExperiences] = useState<string | null>(null);
  
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExperienceCategory>(ExperienceCategory.ALL);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [view, setView] = useState<AppView>('home');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const { currentUser } = useAuth();

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
      setView(newView);
  }, []);

  const handleStartEditExperience = useCallback((experience: Experience) => {
    setEditingExperience(experience);
    setView('edit');
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
      <AITravelPlanner />
      
      <div className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">Descubre Experiencias en el Mapa</h2>
        <p className="text-xl text-gray-300 mb-6">Encuentra tu próxima aventura explorando las actividades cercanas a ti.</p>
        <div className="h-[500px] w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-12">
            <MapComponent experiences={filteredExperiences} onViewExperience={handleViewExperience} />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">Explora Todas las Experiencias</h2>
        <p className="text-xl text-gray-300 mb-6">Filtra y encuentra tu aventura perfecta, guiada por apasionados locales.</p>
        <SearchBar 
          locationFilter={locationFilter}
          categoryFilter={categoryFilter}
          onLocationChange={setLocationFilter}
          onCategoryChange={setCategoryFilter}
        />
      </div>

      {isLoadingExperiences ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-200">Cargando experiencias...</h3>
          </div>
      ) : errorExperiences ? (
          <div className="text-center py-16 bg-red-900/20 border border-red-500 rounded-lg">
            <h3 className="text-xl font-semibold text-red-300">Error al Cargar Datos</h3>
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
          <h3 className="text-xl font-semibold text-gray-200">No se encontraron experiencias</h3>
          <p className="text-gray-400 mt-2">Intenta ajustar tus filtros de búsqueda para encontrar más aventuras.</p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (view) {
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
      case 'detail':
        return selectedExperience ? <ExperienceDetail experience={selectedExperience} onBack={() => handleNavigate('home')} /> : renderHomeView();
      case 'home':
      default:
        return renderHomeView();
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-900">
        <Header 
            onLoginClick={() => setActiveModal('login')}
            onRegisterClick={() => setActiveModal('register')}
            onNavigate={handleNavigate}
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
    </>
  );
};

export default App;