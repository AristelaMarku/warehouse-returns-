import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RmaStatus } from '@warehouse/shared';
import { environment } from '../../../environments/environment';
import { PaginatedRmas, RmaModel } from '../models/rma.model';
import { PaginatedRmaReceiptGroups, ReceiptModel } from '../models/receipt.model';
import { ReceiptStatus } from '@warehouse/shared';

export interface ReceiveDevicePayload {
  receivedSerialNumber: string;
  notes?: string;
}

export interface RmaListQuery {
  status?: RmaStatus;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class RmaApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/rmas`;

  listRmas(query: RmaListQuery = {}): Observable<PaginatedRmas> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    return this.http.get<PaginatedRmas>(this.base, { params });
  }

  getRma(id: string): Observable<RmaModel> {
    return this.http.get<RmaModel>(`${this.base}/${id}`);
  }

  receiveDevice(rmaId: string, payload: ReceiveDevicePayload): Observable<ReceiptModel> {
    return this.http.post<ReceiptModel>(`${this.base}/${rmaId}/receive`, payload);
  }

  cancelRma(rmaId: string): Observable<RmaModel> {
    return this.http.patch<RmaModel>(`${this.base}/${rmaId}/cancel`, {});
  }

  extendWindow(rmaId: string, additionalDays: number): Observable<RmaModel> {
    const params = new HttpParams().set('additionalDays', additionalDays);
    return this.http.patch<RmaModel>(`${this.base}/${rmaId}/extend-window`, {}, { params });
  }

  getAuditLog(rmaId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/${rmaId}/audit`);
  }

  listReceipts(page = 1, limit = 20, status?: ReceiptStatus): Observable<PaginatedRmaReceiptGroups> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedRmaReceiptGroups>(`${environment.apiBaseUrl}/receipts`, { params });
  }
}
