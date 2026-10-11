import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

// BrowserRouter keeps the previous page's scroll offset on navigation, so a
// link clicked halfway down the home page opens the next page halfway down.
// Reset to the top on new pages, but leave back/forward (POP) to the browser's
// own scroll restoration and let hash links jump to their section.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
}
