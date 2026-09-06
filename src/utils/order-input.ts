import { Flags } from '@oclif/core';

import { parseJsonObject } from './json-input.js';
import {
  CURRENCIES,
  ORDER_STATUSES,
  PAYMENT_PROVIDERS,
  validateIsoDateTime,
} from './validation.js';

const DATE_FLAGS = [
  'financial-closed-at', 'fx-locked-at', 'paid-at', 'cancelled-at',
  'completed-at', 'benefit-start', 'benefit-end',
] as const;

const CLEARABLE_ORDER_FIELDS = [
  'external-id', 'metadata', 'product-id', 'product-name', 'purchaser-id', 'channel-id',
  'email', 'phone', 'phone-code', 'current-owner-id', 'financial-closer-id',
  ...DATE_FLAGS, 'amount-cny', 'fx-rate-to-cny', 'payment-provider', 'provider-trade-no',
] as const;

const baseOrderFlags = {
  amount: Flags.integer({ description: 'Order amount in the smallest currency unit', min: 0 }),
  'amount-cny': Flags.integer({ description: 'CNY amount in fen', min: 0 }),
  'benefit-end': Flags.string({ description: 'Benefit end ISO 8601 date-time with timezone' }),
  'benefit-start': Flags.string({ description: 'Benefit start ISO 8601 date-time with timezone' }),
  'cancelled-at': Flags.string({ description: 'Cancellation ISO 8601 date-time with timezone' }),
  'channel-id': Flags.integer({ description: 'Channel ID', min: 1 }),
  'completed-at': Flags.string({ description: 'Completion ISO 8601 date-time with timezone' }),
  currency: Flags.string({ description: 'Currency', options: [...CURRENCIES] }),
  'current-owner-id': Flags.string({ description: 'Current owner user ID' }),
  email: Flags.string({ description: 'Customer email' }),
  'external-id': Flags.string({ description: 'External platform order ID' }),
  'financial-closed-at': Flags.string({ description: 'Financial close ISO 8601 date-time with timezone' }),
  'financial-closer-id': Flags.string({ description: 'Financial closer user ID' }),
  'fx-locked-at': Flags.string({ description: 'FX lock ISO 8601 date-time with timezone' }),
  'fx-rate-to-cny': Flags.string({ description: 'Exchange rate to CNY' }),
  metadata: Flags.string({ description: 'Order metadata as a JSON object' }),
  'order-code': Flags.string({ description: 'Internal order code' }),
  'order-number': Flags.string({ description: 'External-facing order number' }),
  'paid-at': Flags.string({ description: 'Payment ISO 8601 date-time with timezone' }),
  'payment-provider': Flags.string({ description: 'Payment provider', options: [...PAYMENT_PROVIDERS] }),
  phone: Flags.string({ description: 'Customer phone number' }),
  'phone-code': Flags.string({ description: 'Customer phone country code' }),
  'product-id': Flags.string({ description: 'Product ID' }),
  'product-name': Flags.string({ description: 'Product name snapshot' }),
  'provider-trade-no': Flags.string({ description: 'Payment provider transaction number' }),
  'purchaser-id': Flags.string({ description: 'Purchaser user ID' }),
  status: Flags.string({ description: 'Order status', options: [...ORDER_STATUSES] }),
};

export const orderCreateFlags = {
  ...baseOrderFlags,
  amount: Flags.integer({ description: 'Order amount in the smallest currency unit', min: 0, required: true }),
};

export const orderUpdateFlags = {
  ...baseOrderFlags,
  clear: Flags.string({
    description: 'Clear a nullable field; repeat for multiple fields',
    multiple: true,
    options: [...CLEARABLE_ORDER_FIELDS],
  }),
};

type OrderFlags = Record<string, boolean | number | string | string[] | undefined>;

const orderFields: Record<string, string> = {
  amount: 'amount',
  'amount-cny': 'amountCny',
  'benefit-end': 'benefitEnd',
  'benefit-start': 'benefitStart',
  'cancelled-at': 'cancelledAt',
  'channel-id': 'channelId',
  'completed-at': 'completedAt',
  currency: 'currency',
  'current-owner-id': 'currentOwnerId',
  email: 'email',
  'external-id': 'externalId',
  'financial-closed-at': 'financialClosedAt',
  'financial-closer-id': 'financialCloserId',
  'fx-locked-at': 'fxLockedAt',
  'fx-rate-to-cny': 'fxRateToCny',
  metadata: 'metadata',
  'order-code': 'orderCode',
  'order-number': 'orderNumber',
  'paid-at': 'paidAt',
  'payment-provider': 'paymentProvider',
  phone: 'phone',
  'phone-code': 'phoneCode',
  'product-id': 'productId',
  'product-name': 'productName',
  'provider-trade-no': 'providerTradeNo',
  'purchaser-id': 'purchaserId',
  status: 'status',
};

export function orderBody(flags: OrderFlags): Record<string, unknown> {
  for (const name of DATE_FLAGS) {
    const value = flags[name];
    if (typeof value === 'string') validateIsoDateTime(value, `--${name}`);
  }

  const body: Record<string, unknown> = {};
  for (const [flagName, fieldName] of Object.entries(orderFields)) {
    const value = flagName === 'metadata'
      ? parseJsonObject(flags.metadata as string | undefined, '--metadata')
      : flags[flagName];
    if (value !== undefined) body[fieldName] = value;
  }

  for (const flagName of (flags.clear as string[] | undefined) ?? []) {
    if (flags[flagName] !== undefined) {
      throw new Error(`--${flagName} cannot be combined with --clear ${flagName}.`);
    }

    body[orderFields[flagName]] = null;
  }

  return body;
}
