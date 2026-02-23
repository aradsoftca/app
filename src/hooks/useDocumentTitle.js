import { useEffect } from 'react';

/**
 * Sets the document title for the current page.
 * Resets to default title on unmount.
 * @param {string} title - Page-specific title
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | VPN XO` : 'VPN XO - Secure VPN Service';
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocumentTitle;
