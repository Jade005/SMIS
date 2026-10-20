import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import LoadingScreen from './components/common/LoadingScreen';

function AppContent() {
  const { loading, authError, isLoggingIn, isLoggingOut, retryAuth } = useAuth();

  return (
    <>
      <Suspense fallback={<LoadingScreen show={true} />}>
        <AppRoutes />
      </Suspense>

      {/* Global Branded Full-Screen Loading Screen */}
      <LoadingScreen
        show={loading || isLoggingIn || isLoggingOut}
        error={authError}
        onRetry={retryAuth}
        customMessage={
          isLoggingOut
            ? 'Signing out of SMIS...'
            : isLoggingIn
            ? 'Preparing your role dashboard...'
            : undefined
        }
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
