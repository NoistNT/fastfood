'use client';

import type { DirectoryPerson } from '@/modules/dashboard/components/customer-form-dialog';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/modules/core/ui/dialog';
import { Button } from '@/modules/core/ui/button';
import { Input } from '@/modules/core/ui/input';
import { useCSRFToken } from '@/modules/core/hooks/use-csrf-token';
import { toastNotifications } from '@/lib/toast-notifications';

interface MergeCandidate {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  hasCredentials: boolean;
}

interface MergePreview {
  winner: { id: string; name: string };
  loser: { id: string; name: string };
  ordersMoving: number;
  rolesGranting: string[];
  fieldsFilling: string[];
}

interface CustomerMergeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loser: DirectoryPerson | null;
  onSuccess: () => void;
}

/**
 * Two-step duplicate merge: pick the surviving identity through the
 * directory search, review exactly what moves on the confirm screen, then
 * execute. The loser must be record-only — enforced server-side; the picker
 * marks credentialed candidates so owners don't select them as losers.
 */
export function CustomerMergeDialog({
  open,
  onOpenChange,
  loser,
  onSuccess,
}: CustomerMergeDialogProps) {
  const t = useTranslations('Features.dashboard.customers.merge');
  const { getToken } = useCSRFToken();
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<MergeCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [winner, setWinner] = useState<MergeCandidate | null>(null);
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled) setCandidates(result.data?.people ?? []);
      } catch {
        // keep previous results on transient failures
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Fresh session on open (event handler, not effect — avoids
      // cascading renders); dismissals stay blocked while busy below.
      setQuery('');
      setCandidates([]);
      setWinner(null);
      setPreview(null);
    } else if (isMerging || loadingPreview) {
      return;
    }
    onOpenChange(next);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setCandidates([]);
    } else {
      setSearching(true);
    }
  };

  const loadPreview = async (candidate: MergeCandidate) => {
    if (!loser) return;
    setWinner(candidate);
    setLoadingPreview(true);
    try {
      const response = await fetch(
        `/api/customers/merge?winnerId=${candidate.id}&loserId=${loser.id}`
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? t('previewFailed'));
      }
      const result = await response.json();
      setPreview(result.data);
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : t('previewFailed')
      );
      setWinner(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleMerge = async () => {
    if (!loser || !winner) return;
    setIsMerging(true);
    try {
      const csrfToken = await getToken();
      const response = await fetch('/api/customers/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message ?? t('mergeFailed'));
      }
      toastNotifications.success.customerMerged();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toastNotifications.error.genericError(
        error instanceof Error ? error.message : t('mergeFailed')
      );
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {loser ? t('description', { name: loser.name }) : t('descriptionNoLoser')}
          </DialogDescription>
        </DialogHeader>

        {!winner ? (
          <div className="space-y-3">
            <Input
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
            />
            {searching && <p className="text-sm text-muted-foreground">{t('searching')}</p>}
            <ul className="space-y-2">
              {candidates
                .filter((candidate) => candidate.id !== loser?.id)
                .map((candidate) => (
                  <li
                    key={candidate.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[candidate.email, candidate.phoneNumber].filter(Boolean).join(' · ') ||
                          t('noContact')}
                        {candidate.hasCredentials ? ` · ${t('hasAccount')}` : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadPreview(candidate)}
                    >
                      {t('select')}
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            {loadingPreview ? (
              <p className="text-sm text-muted-foreground">{t('loadingPreview')}</p>
            ) : preview ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('winner')}</dt>
                  <dd className="font-medium">{preview.winner.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('loser')}</dt>
                  <dd className="font-medium">{preview.loser.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('ordersMoving')}</dt>
                  <dd className="font-medium">{preview.ordersMoving}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('rolesGranting')}</dt>
                  <dd className="font-medium">
                    {preview.rolesGranting.length > 0
                      ? preview.rolesGranting.join(', ')
                      : t('none')}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t('fieldsFilling')}</dt>
                  <dd className="font-medium">
                    {preview.fieldsFilling.length > 0
                      ? preview.fieldsFilling.join(', ')
                      : t('none')}
                  </dd>
                </div>
              </dl>
            ) : null}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setWinner(null);
                setPreview(null);
              }}
            >
              {t('change')}
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!preview || isMerging}
            onClick={handleMerge}
          >
            {isMerging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('merging')}
              </>
            ) : (
              t('confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
