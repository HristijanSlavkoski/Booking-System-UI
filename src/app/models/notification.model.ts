export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: EmailType;
  variables: string[];
  isActive: boolean;
}

export enum EmailType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  CUSTOM = 'CUSTOM'
}

export interface SendEmailRequest {
  to: string[];
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  type: SMSType;
  variables: string[];
  isActive: boolean;
}

export enum SMSType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  CUSTOM = 'CUSTOM'
}

export interface SendSMSRequest {
  to: string[];
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
}
