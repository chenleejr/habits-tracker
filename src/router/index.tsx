import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import TaskManager from '../pages/TaskManager';
import Statistics from '../pages/Statistics';
import Settings from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <Home />
      },
      {
        path: 'tasks',
        element: <TaskManager />
      },
      {
        path: 'statistics',
        element: <Statistics />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);