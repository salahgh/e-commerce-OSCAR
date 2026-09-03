import 'dotenv/config';
import {
  bootstrapWorker,
  RequestContext,
  ChannelService,
  CustomerService,
  OrderService,
  ProductVariantService,
  ShippingMethodService,
  PaymentMethodService,
  LanguageCode,
  defaultShippingCalculator,
  defaultShippingEligibilityChecker,
  dummyPaymentHandler,
} from '@vendure/core';
import { config } from './vendure-config';

/**
 * OSCAR Fashion - Order Seed Script
 *
 * Seeds the database with ~100 orders with various states, products, and quantities.
 *
 * Run with: npx ts-node src/seed-orders.ts
 * NOTE: Stop the main Vendure server first before running this script.
 */

// Algerian Wilayas
const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa',
  'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued', 'Skikda',
  'Tizi Ouzou', 'Béjaïa', 'Tiaret', 'Tlemcen', 'Ghardaïa', 'Ouargla', 'Médéa'
];

// Order states to distribute
const ORDER_STATES = [
  { state: 'PaymentSettled', weight: 30 },
  { state: 'Shipped', weight: 20 },
  { state: 'Delivered', weight: 25 },
  { state: 'Cancelled', weight: 10 },
  { state: 'ArrangingPayment', weight: 10 },
  { state: 'PartiallyShipped', weight: 5 },
];

// First names (Algerian)
const FIRST_NAMES = [
  'Mohamed', 'Ahmed', 'Ali', 'Youcef', 'Omar', 'Karim', 'Sofiane', 'Riad', 'Nabil', 'Amine',
  'Fatima', 'Aicha', 'Khadija', 'Amina', 'Sara', 'Nadia', 'Leila', 'Samira', 'Houda', 'Meriem'
];

// Last names (Algerian)
const LAST_NAMES = [
  'Benali', 'Bouzid', 'Hamidi', 'Boudiaf', 'Khelifi', 'Brahimi', 'Larbi', 'Messaoudi',
  'Cherifi', 'Hadjadj', 'Belaidi', 'Djebbar', 'Saidi', 'Amrane', 'Ferhat'
];

// Helper to get random element
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get weighted random state
function getWeightedRandomState(): string {
  const totalWeight = ORDER_STATES.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const state of ORDER_STATES) {
    random -= state.weight;
    if (random <= 0) return state.state;
  }
  return 'PaymentSettled';
}

// Generate random date within last 60 days
function randomDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 60);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

async function seedOrders() {
  console.log('🚀 Starting OSCAR Order Seeding...\n');
  console.log('⚠️  Make sure the main Vendure server is STOPPED before running this script.\n');

  const { app } = await bootstrapWorker(config);

  const channelService = app.get(ChannelService);
  const customerService = app.get(CustomerService);
  const orderService = app.get(OrderService);
  const productVariantService = app.get(ProductVariantService);
  const shippingMethodService = app.get(ShippingMethodService);
  const paymentMethodService = app.get(PaymentMethodService);

  const channel = await channelService.getDefaultChannel();
  const ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  // Get available products
  console.log('📦 Fetching available product variants...');
  const variants = await productVariantService.findAll(ctx, { take: 500 });

  if (variants.items.length === 0) {
    console.error('❌ No product variants found. Please run the populate script first.');
    await app.close();
    process.exit(1);
  }
  console.log(`  Found ${variants.items.length} variants\n`);

  // Get or create customers
  console.log('👥 Creating/Finding customers...');
  const customers: any[] = [];

  for (let i = 0; i < 20; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;

    try {
      const result = await customerService.create(ctx, {
        firstName,
        lastName,
        emailAddress: email,
        phoneNumber: `0${5 + Math.floor(Math.random() * 4)}${Math.floor(10000000 + Math.random() * 90000000)}`,
        customFields: {
          wilaya: randomElement(WILAYAS),
          city: `Ville ${i + 1}`,
        },
      }, '');

      // Check if result is a Customer (not an error)
      if ('id' in result) {
        customers.push(result as any);
        console.log(`  ✅ Created customer: ${firstName} ${lastName}`);
      }
    } catch (e: any) {
      // Customer might already exist
      const existing = await customerService.findAll(ctx, {
        filter: { emailAddress: { eq: email } },
        take: 1,
      });
      if (existing.items.length > 0) {
        customers.push(existing.items[0]);
      }
    }
  }
  console.log(`  Total customers: ${customers.length}\n`);

  // Get or create shipping methods
  let shippingMethods = await shippingMethodService.findAll(ctx, {});
  let defaultShippingMethod = shippingMethods.items[0];

  if (!defaultShippingMethod) {
    console.log('📦 Creating default shipping method...');
    defaultShippingMethod = await shippingMethodService.create(ctx, {
      code: 'standard-shipping',
      translations: [
        { languageCode: LanguageCode.en, name: 'Standard Shipping', description: 'Standard delivery' },
        { languageCode: LanguageCode.fr, name: 'Livraison Standard', description: 'Livraison standard' },
        { languageCode: LanguageCode.ar, name: 'التوصيل العادي', description: 'توصيل عادي' },
      ],
      fulfillmentHandler: 'manual-fulfillment',
      checker: {
        code: defaultShippingEligibilityChecker.code,
        // Must supply orderMinimum, otherwise the checker compares against
        // undefined and the method is ALWAYS ineligible — which silently blocks
        // every order from leaving the cart (AddingItems) state.
        arguments: [{ name: 'orderMinimum', value: '0' }],
      },
      calculator: {
        code: defaultShippingCalculator.code,
        arguments: [
          { name: 'rate', value: '50000' },
          { name: 'includesTax', value: 'auto' },
          { name: 'taxRate', value: '0' },
        ],
      },
    });
    console.log('  ✅ Created Standard Shipping method');
  }

  // Get or create payment methods
  let paymentMethods = await paymentMethodService.findAll(ctx, {});
  let defaultPaymentMethod = paymentMethods.items[0];

  if (!defaultPaymentMethod) {
    console.log('💳 Creating default payment method...');
    defaultPaymentMethod = await paymentMethodService.create(ctx, {
      code: 'cash-on-delivery',
      enabled: true,
      translations: [
        { languageCode: LanguageCode.en, name: 'Cash on Delivery', description: 'Pay when you receive' },
        { languageCode: LanguageCode.fr, name: 'Paiement à la livraison', description: 'Payez à la réception' },
        { languageCode: LanguageCode.ar, name: 'الدفع عند الاستلام', description: 'ادفع عند استلام طلبك' },
      ],
      handler: {
        code: dummyPaymentHandler.code,
        arguments: [
          { name: 'automaticSettle', value: 'true' },
        ],
      },
    });
    console.log('  ✅ Created Cash on Delivery payment method');
  }

  console.log(`  Using shipping: ${defaultShippingMethod.name}`);
  console.log(`  Using payment: ${defaultPaymentMethod.name}\n`);

  console.log('🛒 Creating orders...\n');

  let orderCount = 0;
  const targetOrders = 100;
  const stateDistribution: Record<string, number> = {};

  for (let i = 0; i < targetOrders; i++) {
    try {
      const customer = randomElement(customers);
      const targetState = getWeightedRandomState();
      const orderDate = randomDate();
      const wilaya = randomElement(WILAYAS);

      // Create order with random items (1-5 items)
      const numItems = 1 + Math.floor(Math.random() * 5);
      const orderItems = [];

      for (let j = 0; j < numItems; j++) {
        const variant = randomElement(variants.items);
        const quantity = 1 + Math.floor(Math.random() * 3);
        orderItems.push({
          productVariantId: variant.id,
          quantity,
        });
      }

      // Create order using orderService
      const order = await orderService.create(ctx, customer.user?.id);

      // Add items
      for (const item of orderItems) {
        await orderService.addItemToOrder(ctx, order.id, item.productVariantId, item.quantity);
      }

      // Set shipping address
      await orderService.setShippingAddress(ctx, order.id, {
        fullName: `${customer.firstName} ${customer.lastName}`,
        streetLine1: `${Math.floor(1 + Math.random() * 100)} Rue ${randomElement(['des Martyrs', 'Didouche Mourad', 'Ben M\'hidi', 'Hassiba Ben Bouali', 'Amirouche'])}`,
        city: wilaya,
        province: wilaya,
        postalCode: String(10000 + Math.floor(Math.random() * 40000)),
        countryCode: 'DZ',
        phoneNumber: customer.phoneNumber || `05${Math.floor(10000000 + Math.random() * 90000000)}`,
      });

      // Set order custom fields
      await orderService.updateCustomFields(ctx, order.id, {
        wilaya,
        city: `${wilaya} Centre`,
      });

      // Set shipping method if available
      const eligibleMethods = await orderService.getEligibleShippingMethods(ctx, order.id);
      if (eligibleMethods.length > 0) {
        await orderService.setShippingMethod(ctx, order.id, [eligibleMethods[0].id]);
      }

      // Transition order to ArrangingPayment first
      try {
        await orderService.transitionToState(ctx, order.id, 'ArrangingPayment' as any);
      } catch (e) {
        // May fail if order doesn't meet requirements
      }

      // Add payment to the order to settle it
      const updatedOrder = await orderService.findOne(ctx, order.id);
      if (updatedOrder && updatedOrder.state === 'ArrangingPayment') {
        try {
          // Add a payment using the payment method
          await orderService.addPaymentToOrder(ctx, order.id, {
            method: defaultPaymentMethod.code,
            metadata: { notes: 'Seeded order payment' },
          });
        } catch (e) {
          // Payment may fail
        }
      }

      // Now transition based on target state
      const currentOrder = await orderService.findOne(ctx, order.id);
      if (currentOrder) {
        // Handle transitions based on target state
        if (targetState === 'Cancelled') {
          try {
            await orderService.transitionToState(ctx, order.id, 'Cancelled' as any);
          } catch (e) {
            // May fail
          }
        } else if (['Shipped', 'PartiallyShipped', 'Delivered'].includes(targetState)) {
          // Need to create fulfillment first for shipping
          if (currentOrder.state === 'PaymentSettled') {
            try {
              // Create fulfillment
              const fulfillment = await orderService.createFulfillment(ctx, {
                // The manual-fulfillment handler requires a `method` argument;
                // fulfillment.method is NOT NULL, so empty args throws.
                handler: {
                  code: 'manual-fulfillment',
                  arguments: [
                    { name: 'method', value: 'Standard Shipping' },
                    { name: 'trackingCode', value: `DZ${String(order.id).padStart(6, '0')}` },
                  ],
                },
                lines: currentOrder.lines.map(line => ({
                  orderLineId: line.id,
                  quantity: line.quantity,
                })),
              });

              // Transition fulfillment to Shipped
              if (fulfillment && 'id' in fulfillment) {
                await orderService.transitionFulfillmentToState(ctx, fulfillment.id, 'Shipped' as any);

                if (targetState === 'Delivered') {
                  await orderService.transitionFulfillmentToState(ctx, fulfillment.id, 'Delivered' as any);
                }
              }
            } catch (e) {
              // Fulfillment may fail
            }
          }
        }
      }

      // Get final state
      const finalOrder = await orderService.findOne(ctx, order.id);
      const finalState = finalOrder?.state || 'Unknown';

      stateDistribution[finalState] = (stateDistribution[finalState] || 0) + 1;
      orderCount++;

      if (orderCount % 10 === 0) {
        console.log(`  📝 Created ${orderCount}/${targetOrders} orders...`);
      }
    } catch (e: any) {
      console.log(`  ⚠️ Order ${i + 1} failed: ${e.message}`);
    }
  }

  console.log(`\n📊 Order Seed Summary:`);
  console.log(`   Total Orders: ${orderCount}`);
  console.log(`   State Distribution:`);
  for (const [state, count] of Object.entries(stateDistribution)) {
    console.log(`     - ${state}: ${count}`);
  }

  console.log('\n✨ Order seeding completed!\n');

  await app.close();
  process.exit(0);
}

seedOrders().catch((err) => {
  console.error('❌ Order seeding failed:', err);
  process.exit(1);
});
