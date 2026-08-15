import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

function getPlanName(variantId?: number | string): string | null {
  const plans: Record<string, string> = {
    '2013917': 'Starter',
    '2013927': 'Growth',
  };
  return variantId ? plans[String(variantId)] ?? null : null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  const customData = event.meta?.custom_data;
  const attrs = event.data?.attributes;
  const subscriptionId = event.data?.id;

  logger.info({ event: 'lemonsqueezy_webhook_received', eventName, subscriptionId });

  try {
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed': {
        const userId = customData?.user_id;

        if (!userId) {
          logger.error({ event: 'lemonsqueezy_webhook_missing_user_id', subscriptionId, eventName });
          break;
        }

        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            lemonsqueezy_subscription_id: subscriptionId,
            lemonsqueezy_customer_id: String(attrs?.customer_id ?? ''),
            status: attrs?.status,
            plan: getPlanName(attrs?.variant_id),
            current_period_end: attrs?.renews_at ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'lemonsqueezy_subscription_id' }
        );
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_paused': {
        await supabase
          .from('subscriptions')
          .update({ status: attrs?.status, updated_at: new Date().toISOString() })
          .eq('lemonsqueezy_subscription_id', subscriptionId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }
  } catch (err) {
    logger.error({
      event: 'lemonsqueezy_webhook_processing_failed',
      eventName,
      subscriptionId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  logger.info({ event: 'lemonsqueezy_webhook_processed', eventName, subscriptionId });
  return NextResponse.json({ received: true }, { status: 200 });
}