import { useParams, useNavigate } from 'react-router-dom';
import { WebStoriesViewer } from '@/components/ads/WebStoriesViewer';

/**
 * Public page for viewing WebStories campaigns
 * Route: /stories/:campaignId
 */
export default function WebStoryViewerPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  return (
    <WebStoriesViewer
      campaignId={campaignId}
      onClose={() => navigate(-1)}
    />
  );
}
