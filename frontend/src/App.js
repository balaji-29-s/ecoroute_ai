import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import MapComponent from './components/Map';

function App() {
  return (
    <ErrorBoundary>
      <MapComponent />
    </ErrorBoundary>
  );
}

export default App;