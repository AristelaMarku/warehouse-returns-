import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RmaApiService } from './rma-api.service';
import { environment } from '../../../environments/environment';
import { ReceiptStatus } from '@warehouse/shared';

const BASE = `${environment.apiBaseUrl}/rmas`;
const RECEIPTS_BASE = `${environment.apiBaseUrl}/receipts`;
const EMPTY_PAGE = { data: [], meta: { total: 0, page: 1, limit: 20, pages: 0 } };

describe('RmaApiService', () => {
  let service: RmaApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service  = TestBed.inject(RmaApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── listRmas ──────────────────────────────────────────────────────────────

  it('listRmas() sends GET to /rmas', () => {
    service.listRmas().subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.method).toBe('GET');
    req.flush(EMPTY_PAGE);
  });

  it('listRmas() includes Cache-Control: no-cache header', () => {
    service.listRmas().subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.headers.get('Cache-Control')).toBe('no-cache');
    req.flush(EMPTY_PAGE);
  });

  it('listRmas() passes status param', () => {
    service.listRmas({ status: 'ACTIVE' }).subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.get('status')).toBe('ACTIVE');
    req.flush(EMPTY_PAGE);
  });

  it('listRmas() omits status param when not provided', () => {
    service.listRmas({}).subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.has('status')).toBe(false);
    req.flush(EMPTY_PAGE);
  });

  it('listRmas() passes page and limit params', () => {
    service.listRmas({ page: 2, limit: 10 }).subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(EMPTY_PAGE);
  });

  it('listRmas() passes search param', () => {
    service.listRmas({ search: 'jane' }).subscribe();
    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.get('search')).toBe('jane');
    req.flush(EMPTY_PAGE);
  });

  // ── getRma ────────────────────────────────────────────────────────────────

  it('getRma() sends GET to /rmas/:id', () => {
    service.getRma('rma-123').subscribe();
    const req = httpMock.expectOne(`${BASE}/rma-123`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // ── receiveDevice ─────────────────────────────────────────────────────────

  it('receiveDevice() sends POST to /rmas/:id/receive with payload', () => {
    service.receiveDevice('rma-123', { receivedSerialNumber: 'SN001', notes: 'ok' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/rma-123/receive`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ receivedSerialNumber: 'SN001', notes: 'ok' });
    req.flush({});
  });

  // ── cancelRma ─────────────────────────────────────────────────────────────

  it('cancelRma() sends PATCH to /rmas/:id/cancel', () => {
    service.cancelRma('rma-123').subscribe();
    const req = httpMock.expectOne(`${BASE}/rma-123/cancel`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  // ── extendWindow ──────────────────────────────────────────────────────────

  it('extendWindow() sends PATCH with additionalDays param', () => {
    service.extendWindow('rma-123', 7).subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/rma-123/extend-window`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.params.get('additionalDays')).toBe('7');
    req.flush({});
  });

  // ── getAuditLog ───────────────────────────────────────────────────────────

  it('getAuditLog() sends GET to /rmas/:id/audit', () => {
    service.getAuditLog('rma-123').subscribe();
    const req = httpMock.expectOne(`${BASE}/rma-123/audit`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── listReceipts ──────────────────────────────────────────────────────────

  it('listReceipts() sends GET to /receipts with page and limit', () => {
    service.listReceipts(2, 10).subscribe();
    const req = httpMock.expectOne(r => r.url === RECEIPTS_BASE);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(EMPTY_PAGE);
  });

  it('listReceipts() passes status param when provided', () => {
    service.listReceipts(1, 20, ReceiptStatus.SUCCESS).subscribe();
    const req = httpMock.expectOne(r => r.url === RECEIPTS_BASE);
    expect(req.request.params.get('status')).toBe('SUCCESS');
    req.flush(EMPTY_PAGE);
  });

  it('listReceipts() omits status param when not provided', () => {
    service.listReceipts().subscribe();
    const req = httpMock.expectOne(r => r.url === RECEIPTS_BASE);
    expect(req.request.params.has('status')).toBe(false);
    req.flush(EMPTY_PAGE);
  });

  it('listReceipts() includes Cache-Control: no-cache header', () => {
    service.listReceipts().subscribe();
    const req = httpMock.expectOne(r => r.url === RECEIPTS_BASE);
    expect(req.request.headers.get('Cache-Control')).toBe('no-cache');
    req.flush(EMPTY_PAGE);
  });
});
