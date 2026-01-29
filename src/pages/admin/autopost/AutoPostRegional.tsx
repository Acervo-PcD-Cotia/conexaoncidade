import { Navigate } from "react-router-dom";

/**
 * Auto Post Regional - Grande Cotia
 * 
 * Redirects to the main AutoPost dashboard with regional context.
 * The regional functionality uses the same infrastructure as AutoPost PRO,
 * but focuses exclusively on the Grande Cotia cluster.
 */
const AutoPostRegional = () => {
  // Redirect to main AutoPost dashboard
  // Future: Add query param or context for regional filter
  return <Navigate to="/admin/autopost" replace />;
};

export default AutoPostRegional;
