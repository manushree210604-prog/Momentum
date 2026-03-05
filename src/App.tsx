import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { HabitTracker } from './pages/HabitTracker';
import { Goals } from './pages/Goals';
import { Reports } from './pages/Reports';

function App() {
  return (
    <DataProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="habits" element={<HabitTracker />} />
            <Route path="goals" element={<Goals />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
