import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before imports
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(),
}));
vi.mock('@/lib/csrf', () => ({
  getCSRFTokenFromRequest: vi.fn(),
  verifyCSRFToken: vi.fn(),
}));
vi.mock('@/lib/api-response');

const selectQueues: unknown[][] = [];
const batchedStatements: unknown[][] = [];

function makeSelectBuilder(rows: unknown[]) {
  const builder: any = {};
  builder.from = () => builder;
  builder.where = () => builder;
  builder.limit = async () => rows;
  builder.then = (resolve: any, reject: any) => Promise.resolve(rows).then(resolve, reject);
  return builder;
}

vi.mock('@/db/drizzle', () => ({
  db: {
    select: () => makeSelectBuilder(selectQueues.shift() ?? []),
    insert: () => ({ values: () => ({}) }),
    update: () => ({ set: () => ({ where: () => ({}) }) }),
    delete: () => ({ where: () => ({}) }),
    batch: async (statements: unknown[]) => {
      batchedStatements.push(statements);
      return [];
    },
  },
}));

import { GET as previewMerge, POST as executeMerge } from '@/app/api/customers/merge/route';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockGetCSRFToken = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);

const WINNER_ID = '550e8400-e29b-41d4-a716-446655440001';
const LOSER_ID = '550e8400-e29b-41d4-a716-446655440002';

const winnerRow = {
  id: WINNER_ID,
  name: 'Ana Real',
  email: null,
  phoneNumber: null,
  passwordHash: 'hash',
};
const loserRow = {
  id: LOSER_ID,
  name: 'Ana Dupe',
  email: 'ana@example.com',
  phoneNumber: '54911',
  passwordHash: null,
};

function previewRequest(winnerId: string, loserId: string) {
  return new NextRequest(
    `http://localhost:3000/api/customers/merge?winnerId=${winnerId}&loserId=${loserId}`
  );
}

function mergeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/customers/merge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('/api/customers/merge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectQueues.length = 0;
    batchedStatements.length = 0;

    mockApiSuccess.mockImplementation((data, options) =>
      NextResponse.json(
        {
          success: true,
          data,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 200 }
      )
    );
    mockApiError.mockImplementation((code, message, options) =>
      NextResponse.json(
        {
          success: false,
          error: { code, message },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 500 }
      )
    );
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'admin-1' } } as never);
    mockGetCSRFToken.mockResolvedValue('token');
    mockVerifyCSRFToken.mockResolvedValue(true);
  });

  describe('GET preview', () => {
    it('returns 401 without a session', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });

      const response = await previewMerge(previewRequest(WINNER_ID, LOSER_ID));

      expect(response.status).toBe(401);
      expect(selectQueues).toHaveLength(0);
    });

    it('returns 403 for non-admin roles', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

      const response = await previewMerge(previewRequest(WINNER_ID, LOSER_ID));

      expect(response.status).toBe(403);
    });

    it('returns 400 for identical ids', async () => {
      const response = await previewMerge(previewRequest(WINNER_ID, WINNER_ID));

      expect(response.status).toBe(400);
    });

    it('returns 404 when either person is missing', async () => {
      selectQueues.push([winnerRow], []);

      const response = await previewMerge(previewRequest(WINNER_ID, LOSER_ID));

      expect(response.status).toBe(404);
    });

    it('returns 400 when the loser holds credentials', async () => {
      selectQueues.push([winnerRow], [{ ...loserRow, passwordHash: 'hash' }]);

      const response = await previewMerge(previewRequest(WINNER_ID, LOSER_ID));
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('previews orders, roles, and fields without writing', async () => {
      selectQueues.push(
        [winnerRow],
        [loserRow],
        [{ roleId: 1 }],
        [{ roleId: 1 }, { roleId: 2 }],
        [{ value: 3 }],
        [{ name: 'staff' }]
      );

      const response = await previewMerge(previewRequest(WINNER_ID, LOSER_ID));
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toEqual({
        winner: { id: WINNER_ID, name: 'Ana Real' },
        loser: { id: LOSER_ID, name: 'Ana Dupe' },
        ordersMoving: 3,
        rolesGranting: ['staff'],
        fieldsFilling: ['email', 'phoneNumber'],
      });
      expect(batchedStatements).toHaveLength(0);
    });
  });

  describe('POST execute', () => {
    it('returns 401 without a session', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));

      expect(response.status).toBe(401);
    });

    it('returns 403 for an invalid CSRF token', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));

      expect(response.status).toBe(403);
      expect(batchedStatements).toHaveLength(0);
    });

    it('returns 400 when merging a person into themselves', async () => {
      const response = await executeMerge(
        mergeRequest({ winnerId: WINNER_ID, loserId: WINNER_ID })
      );

      expect(response.status).toBe(400);
      expect(batchedStatements).toHaveLength(0);
    });

    it('returns 404 when the loser is already gone', async () => {
      selectQueues.push([winnerRow], []);

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));

      expect(response.status).toBe(404);
      expect(batchedStatements).toHaveLength(0);
    });

    it('returns 400 when the loser holds credentials', async () => {
      selectQueues.push([winnerRow], [{ ...loserRow, passwordHash: 'hash' }]);

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));

      expect(response.status).toBe(400);
      expect(batchedStatements).toHaveLength(0);
    });

    it('executes the full ledger in one batch', async () => {
      selectQueues.push(
        [winnerRow],
        [loserRow],
        [{ roleId: 1 }],
        [{ roleId: 1 }, { roleId: 2 }],
        [{ value: 3 }]
      );

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toEqual({
        merged: {
          winnerId: WINNER_ID,
          loserId: LOSER_ID,
          ordersMoved: 3,
          rolesGranted: [2],
          fieldsFilled: ['email', 'phoneNumber'],
        },
      });
      // Orders repoint + roles union + field fill + token invalidation +
      // soft-delete — a single atomic batch.
      expect(batchedStatements).toHaveLength(1);
      expect(batchedStatements[0]).toHaveLength(5);
    });

    it('skips empty writes when nothing needs union or fill', async () => {
      const completeWinner = {
        ...winnerRow,
        email: 'ana@example.com',
        phoneNumber: '54911',
        passwordHash: null,
      };
      selectQueues.push(
        [completeWinner],
        [{ ...loserRow }],
        [{ roleId: 1 }],
        [{ roleId: 1 }],
        [{ value: 0 }]
      );

      const response = await executeMerge(mergeRequest({ winnerId: WINNER_ID, loserId: LOSER_ID }));

      expect(response.status).toBe(200);
      expect(batchedStatements).toHaveLength(1);
      expect(batchedStatements[0]).toHaveLength(3);
    });
  });
});
