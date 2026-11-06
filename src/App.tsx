import { Navigate, Route, Routes } from 'react-router';
import { StoreProvider } from '@/lib/store';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import BatchPage from '@/pages/BatchPage';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import CabinetLayout from '@/pages/cabinet/CabinetLayout';
import Dashboard from '@/pages/cabinet/Dashboard';
import Products from '@/pages/cabinet/Products';
import Batches from '@/pages/cabinet/Batches';
import Scanner from '@/pages/Scanner';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} /><Route path="scan" element={<Scanner />} />
          <Route path="demo" element={<Scanner initialCode="7622210721976" />} />
          <Route path="batch/b1042" element={<Navigate to="/demo" replace />} />
          <Route path="batch/b1039" element={<Navigate to="/demo" replace />} />
          <Route path="batch/:batchId" element={<BatchPage />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
          <Route path="cabinet" element={<CabinetLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="batches" element={<Batches />} />
          </Route>
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Landing />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
