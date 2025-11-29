'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { publishPlannerDraft, savePlannerDraft } from '@/app/lib/actions';

type Props = {
  planId: string;
  locationId: string;
  week: string;
  draftId: string;
  primaryPillClass: string;
};

export default function PlannerBoardActions({ planId, locationId, week, draftId, primaryPillClass }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<'save' | 'publish' | null>(null);

  const handle = (mode: 'save' | 'publish') => {
    setPending(mode);
    const fd = new FormData();
    fd.set('planningId', planId);
    fd.set('locationId', locationId);
    fd.set('week', week);
    fd.set('draftId', draftId);
    fd.set('path', `/dashboard/planner/${locationId}/${planId}?draftId=${draftId}${week ? `&week=${encodeURIComponent(week)}` : ''}`);

    startTransition(async () => {
      try {
        if (mode === 'save') {
          await savePlannerDraft(fd);
        } else {
          await publishPlannerDraft(fd);
        }
      } finally {
        setPending(null);
        router.push('/dashboard/planner');
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={() => handle('save')}
        className={primaryPillClass}
        disabled={pending !== null}
      >
        {pending === 'save' ? 'Saving…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => handle('publish')}
        className={primaryPillClass}
        disabled={pending !== null}
      >
        {pending === 'publish' ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  );
}
