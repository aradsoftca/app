// Re-export useAuth from AuthContext for backward compatibility
// All components importing from './hooks/useAuth' will now use the shared context
export { useAuth } from '../contexts/AuthContext';
