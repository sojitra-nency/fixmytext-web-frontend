import { lazy, Suspense, useEffect } from 'react';
import './assets/css/App.css';
import Alert from './components/layout/Alert';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import OnboardingModal from './components/layout/OnboardingModal';
import PageSkeleton from './components/layout/PageSkeleton';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SharePage = lazy(() => import('./pages/SharePage'));

import { AlertProvider, useAlertContext } from './contexts/AlertContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import PassPurchaseModal from './components/subscription/PassPurchaseModal';
import { ROUTES } from './constants';

function AppInner() {
  const { alerts, showAlert, dismissAlert } = useAlertContext();
  const { mode, setMode } = useThemeContext();
  const { user, isAuthenticated, gamification, subscription } = useAppContext();

  // Listen for global RTK Query errors from middleware
  useEffect(() => {
    const handler = (e) => {
      const { message, type } = e.detail;
      showAlert(message, type);
    };
    window.addEventListener('rtk-api-error', handler);
    return () => window.removeEventListener('rtk-api-error', handler);
  }, [showAlert]);

  const handleOnboardingComplete = (persona) => {
    gamification.setPersona(persona);
  };

  return (
    <>
      {!gamification.onboarded && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <Navbar showAlert={showAlert} />
      <Alert alerts={alerts} dismissAlert={dismissAlert} />
      <PassPurchaseModal
        show={subscription.showUpgradeModal}
        onDismiss={subscription.dismissUpgradeModal}
        blockedTool={subscription.blockedTool}
        subscription={subscription}
      />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route
            exact
            path={ROUTES.HOME}
            element={
              <Home
                mode={mode}
                setMode={setMode}
                showAlert={showAlert}
                gamification={gamification}
                user={user}
                isAuthenticated={isAuthenticated}
                subscription={subscription}
              />
            }
          />
          <Route exact path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage showAlert={showAlert} />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage showAlert={showAlert} />} />
          <Route
            path={ROUTES.PRICING}
            element={<PricingPage showAlert={showAlert} subscription={subscription} />}
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <DashboardPage
                gamification={gamification}
                user={user}
                isAuthenticated={isAuthenticated}
                showAlert={showAlert}
                mode={mode}
                setMode={setMode}
                subscription={subscription}
              />
            }
          />
          <Route path={ROUTES.SHARE} element={<SharePage showAlert={showAlert} />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <Router>
      <AlertProvider>
        <ThemeProvider>
          <AppProvider>
            <AppInner />
          </AppProvider>
        </ThemeProvider>
      </AlertProvider>
    </Router>
  );
}

export default App;
