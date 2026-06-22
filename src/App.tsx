import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Overview from './pages/Overview';
import Queue from './pages/Queue';
import Consultant from './pages/Consultant';
import WaitingAnalysis from './pages/WaitingAnalysis';
import AlertCenter from './pages/AlertCenter';
import ExportReport from './pages/ExportReport';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/overview" element={<Overview />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/consultant" element={<Consultant />} />
        <Route path="/waiting" element={<WaitingAnalysis />} />
        <Route path="/alert" element={<AlertCenter />} />
        <Route path="/export" element={<ExportReport />} />
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}
