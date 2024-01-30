import type { ApiProject } from '@lib/backend/backend-types';
import createServerComponentClient from '@lib/backend/client/create-server-component-client';
import { notFound } from 'next/navigation';
import KpiCard from '../_components/kpi-card';

type Props = {
  params: {
    projectSlug: string;
  };
};

export default async function Page({ params: { projectSlug } }: Props) {
  const backendClient = await createServerComponentClient();
  const project = await backendClient.sendRequest<{
    message: string;
    payload: ApiProject;
  }>(`/api/v1/projects/${projectSlug}?with_schemas=1`);

  if (!project.success) {
    return notFound();
  }

  const monthlyUsage = await backendClient.sendRequest<{
    message: string;
    payload: number;
  }>(`/api/v1/projects/${project.data.payload.id}/usage?timeframe=month`);

  if (!monthlyUsage.success) {
    return notFound();
  }

  const allTimeUsage = await backendClient.sendRequest<{
    message: string;
    payload: number;
  }>(`/api/v1/projects/${project.data.payload.id}/usage?timeframe=millennium`);

  if (!allTimeUsage.success) {
    return notFound();
  }

  // TODO: We should add version limit, and usage limit to account
  return (
    <div className="flex grow flex-col">
      <div className="grid grid-cols-3 gap-2">
        <KpiCard
          footer="Resets in 15 days"
          metric={`${project.data.payload.schemas.length} versions`}
          progress={{
            value: 50,
            startText: '0 versions',
            endText: '100 versions',
            tooltip: `50% (${project.data.payload.schemas.length} versions)`,
          }}
          title="Versions"
        />
        <KpiCard
          footer="Resets in 15 days"
          metric={`${monthlyUsage.data.payload} requests`}
          progress={{
            value: 25,
            startText: `${monthlyUsage.data.payload} req/month`,
            endText: '5,000 req/month',
            tooltip: `22% (${monthlyUsage.data.payload} requests)`,
          }}
          title="Monthly usage"
        />
        <KpiCard
          footer="Does not reset"
          metric={`${allTimeUsage.data.payload} requests`}
          progress={{
            value: 0,
            startText: '0 req/month',
            endText: 'Unlimited req/month',
            tooltip: `0% (${allTimeUsage.data.payload} requests)`,
          }}
          title="All time usage"
        />
      </div>
      <div>Some other stuff</div>
    </div>
  );
}
