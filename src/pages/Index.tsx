import { useApp } from '@/contexts/AppContext';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';

const Index = () => {
  const { isOnboarded } = useApp();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return <Dashboard />;
};

export default Index;
