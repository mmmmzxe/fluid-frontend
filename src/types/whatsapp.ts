export interface WhatsAppSettingsData {
  accountUniqueId: string;
  apiSecret: string;
  apiBaseUrl: string;
  webhookSecret: string;
  botPhone: string;
  instapayPhone: string;
  vodafonePhone: string;
  isEnabled: boolean;
  autoSendOrderConfirmation: boolean;
  createdAt?: string;
  updatedAt?: string;
}
