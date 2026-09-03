import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  defaultShippingEligibilityChecker,
  LanguageCode,
  Logger,
  manualFulfillmentHandler,
  ProcessContext,
  RequestContextService,
  ShippingMethodService,
} from '@vendure/core';
import { DeliveryMode, wilayaRateCalculator } from './wilaya-rate-calculator';

const loggerCtx = 'ShippingSetupService';

/** The single flat-rate method created by the original seed; replaced by the two below. */
const LEGACY_METHOD_CODE = 'standard-shipping';

interface MethodDefinition {
  code: string;
  mode: DeliveryMode;
  translations: Array<{ languageCode: LanguageCode; name: string; description: string }>;
}

export const DELIVERY_METHODS: readonly MethodDefinition[] = [
  {
    code: 'home-delivery',
    mode: 'home',
    translations: [
      { languageCode: LanguageCode.fr, name: 'Livraison à domicile', description: 'Livrée à votre adresse par le transporteur.' },
      { languageCode: LanguageCode.ar, name: 'التوصيل إلى المنزل', description: 'يوصلها المندوب إلى عنوانك.' },
      { languageCode: LanguageCode.en, name: 'Home delivery', description: 'Delivered to your address by the courier.' },
    ],
  },
  {
    code: 'office-delivery',
    mode: 'office',
    translations: [
      { languageCode: LanguageCode.fr, name: 'Livraison au bureau (stop desk)', description: 'À retirer au bureau du transporteur le plus proche de chez vous.' },
      { languageCode: LanguageCode.ar, name: 'التوصيل إلى المكتب', description: 'استلم طلبك من أقرب مكتب لشركة التوصيل.' },
      { languageCode: LanguageCode.en, name: 'Pickup at courier office', description: 'Collect your parcel at the courier office nearest to you.' },
    ],
  },
];

/**
 * Makes sure the two per-wilaya delivery methods exist on the default channel.
 *
 * Runs once at server start (not on workers or seed scripts), so a deploy is all
 * it takes to get them into production. Prices come from the rate table in
 * `wilaya-shipping-rates.ts` via the `wilaya-rate-calculator`. The first time the
 * methods are created, the original flat "standard-shipping" method is retired so
 * customers see exactly two options.
 */
@Injectable()
export class ShippingSetupService implements OnApplicationBootstrap {
  constructor(
    private processContext: ProcessContext,
    private requestContextService: RequestContextService,
    private shippingMethodService: ShippingMethodService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.processContext.isServer) return;
    try {
      await this.ensureDeliveryMethods();
    } catch (err: unknown) {
      Logger.error(`Could not set up the delivery methods: ${String(err)}`, loggerCtx);
    }
  }

  private async ensureDeliveryMethods(): Promise<void> {
    const ctx = await this.requestContextService.create({ apiType: 'admin' });
    const existing = (await this.shippingMethodService.findAll(ctx)).items;
    const existingCodes = new Set(existing.map((m) => m.code));

    let created = 0;
    for (const def of DELIVERY_METHODS) {
      if (existingCodes.has(def.code)) continue;
      await this.shippingMethodService.create(ctx, {
        code: def.code,
        translations: def.translations,
        fulfillmentHandler: manualFulfillmentHandler.code,
        checker: {
          code: defaultShippingEligibilityChecker.code,
          // Without an explicit orderMinimum the default checker compares against
          // undefined and the method is never eligible.
          arguments: [{ name: 'orderMinimum', value: '0' }],
        },
        calculator: {
          code: wilayaRateCalculator.code,
          arguments: [{ name: 'mode', value: def.mode }],
        },
      });
      created++;
      Logger.info(`Created shipping method "${def.code}"`, loggerCtx);
    }

    if (created > 0) {
      const legacy = existing.find((m) => m.code === LEGACY_METHOD_CODE);
      if (legacy) {
        await this.shippingMethodService.softDelete(ctx, legacy.id);
        Logger.info(`Retired legacy shipping method "${LEGACY_METHOD_CODE}"`, loggerCtx);
      }
    }
  }
}
