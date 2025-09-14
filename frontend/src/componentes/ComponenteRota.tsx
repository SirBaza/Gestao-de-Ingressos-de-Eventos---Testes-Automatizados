import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/ContextoAutenticacao';

interface ComponenteRotaProps {
  children: ReactNode;
  tipoUsuarioRequerido?: 'organizador' | 'comprador';
}

export const ComponenteRota: React.FC<ComponenteRotaProps> = ({ 
  children, 
  tipoUsuarioRequerido 
}) => {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (tipoUsuarioRequerido && usuario.tipoUsuario !== tipoUsuarioRequerido) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
