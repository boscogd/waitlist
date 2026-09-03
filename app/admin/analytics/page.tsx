import AnalyticsAdmin from './AnalyticsAdmin';

// /admin/analytics — protegido por middleware.ts (cookie httpOnly admin-session).
export default function AnalyticsPage() {
  return <AnalyticsAdmin />;
}
