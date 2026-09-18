import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Layout from './Layout.tsx'
import App from './App.tsx'
import Login from './Login.tsx'
import Detalhes from './Detalhes.tsx'
import MinhasPropostas from './MinhasPropostas.tsx'
import CadCliente from './CadCliente.tsx'

// ----------------- Rotas de Admin
import AdminLayout from './admin/AdminLayout.tsx';
import AdminLogin from './admin/AdminLogin.tsx';            
import AdminDashboard from './admin/AdminDashboard.tsx';    
import AdminCarros from './admin/AdminCarros.tsx';          
import AdminNovoCarro from './admin/AdminNovoCarro.tsx';          
import AdminPropostas from './admin/AdminPropostas.tsx';       

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const rotas = createBrowserRouter([
  {
    path: "/admin/login",
    element: <AdminLogin />,   // rota do form de login sem o Layout da Área Administrativa
  },
  {
    path: "/admin",
    element: <AdminLayout />,  // layout principal do admin com menus e outlet
    children: [
      { index: true, element: <AdminDashboard /> },     // rota /admin
      { path: "carros", element: <AdminCarros /> },     // rota /admin/carros
      { path: "carros/novo", element: <AdminNovoCarro /> },  // ...
      { path: "propostas", element: <AdminPropostas /> },  // ...      
    ],
  },
  {
    path: '/',
    element: <Layout />,         // Layout das páginas do cliente
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'detalhes/:carroId', element: <Detalhes /> },
      { path: 'minhasPropostas', element: <MinhasPropostas /> },
      { path: 'cadCliente', element: <CadCliente /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)