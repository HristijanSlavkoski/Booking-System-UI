import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Holiday, Discount, SystemConfig } from '../../models/config.model';
import { EmailTemplate, SMSTemplate, SendEmailRequest, SendSMSRequest } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiService = inject(ApiService);

  getHolidays(): Observable<Holiday[]> {
    return this.apiService.get<Holiday[]>('/admin/holidays');
  }

  createHoliday(holiday: Partial<Holiday>): Observable<Holiday> {
    return this.apiService.post<Holiday>('/admin/holidays', holiday);
  }

  deleteHoliday(id: string): Observable<void> {
    return this.apiService.delete<void>(`/admin/holidays/${id}`);
  }

  getDiscounts(): Observable<Discount[]> {
    return this.apiService.get<Discount[]>('/admin/discounts');
  }

  createDiscount(discount: Partial<Discount>): Observable<Discount> {
    return this.apiService.post<Discount>('/admin/discounts', discount);
  }

  updateDiscount(id: string, discount: Partial<Discount>): Observable<Discount> {
    return this.apiService.put<Discount>(`/admin/discounts/${id}`, discount);
  }

  deleteDiscount(id: string): Observable<void> {
    return this.apiService.delete<void>(`/admin/discounts/${id}`);
  }

  updateSystemConfig(config: SystemConfig): Observable<SystemConfig> {
    return this.apiService.put<SystemConfig>('/admin/config/system', config);
  }

  getEmailTemplates(): Observable<EmailTemplate[]> {
    return this.apiService.get<EmailTemplate[]>('/admin/templates/email');
  }

  createEmailTemplate(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    return this.apiService.post<EmailTemplate>('/admin/templates/email', template);
  }

  updateEmailTemplate(id: string, template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    return this.apiService.put<EmailTemplate>(`/admin/templates/email/${id}`, template);
  }

  deleteEmailTemplate(id: string): Observable<void> {
    return this.apiService.delete<void>(`/admin/templates/email/${id}`);
  }

  sendEmail(request: SendEmailRequest): Observable<void> {
    return this.apiService.post<void>('/admin/notifications/email', request);
  }

  getSMSTemplates(): Observable<SMSTemplate[]> {
    return this.apiService.get<SMSTemplate[]>('/admin/templates/sms');
  }

  sendSMS(request: SendSMSRequest): Observable<void> {
    return this.apiService.post<void>('/admin/notifications/sms', request);
  }

  getDashboardStats(): Observable<any> {
    return this.apiService.get<any>('/admin/dashboard/stats');
  }
}
