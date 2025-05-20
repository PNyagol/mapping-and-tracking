import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// Create a function to map Toolpad-compatible navigation with react-router
export function useToolpadNavigation(navItems) {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(() => {
    return navItems.map((item) => {
      if (item.kind) return item;
      return {
        ...item,
        selected: location.pathname === item.path,
        onClick: (event) => {
            event?.preventDefault?.();
            navigate(item.path)
        },
      };
    });
  }, [navItems, navigate, location.pathname]);
}
