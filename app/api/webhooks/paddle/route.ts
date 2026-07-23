import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const match = signatureHeader.match(/^ts=(\d+);h1=([a-f0-9]+)$/);
  if (!match) return false;

  const [, ts, h1] = match;

  // Reject anything older than 5 minutes to protect against replay
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (age > 300) return false;

  const signedPayload = `${ts}:${rawBody}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const actualBuf = Buffer.from(h1, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}
function getPlanName(priceId?: string): string | null {
    const plans: Record<string, string> = {
      'pri_01ky4d97vn69zedfatxtbcznre': 'Starter',
      'pri_01ky4d4fvtbzf10jzybs62t0rb': 'Growth',
    };
    return priceId ? plans[priceId] ?? null : null;
  }

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('paddle-signature');
  const secret = process.env.PADDLE_WEBHOOK_SECRET!;

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType = event.event_type;
  const data = event.data;

  logger.info({ event: 'paddle_webhook_received', eventType, subscriptionId: data?.id });

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.activated': {
        const userId = data.custom_data?.user_id;
        
            if (!userId) {
              logger.error({ event: 'paddle_webhook_missing_user_id', subscriptionId: data.id, eventType });
              break;
                  
        }

        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            paddle_subscription_id: data.id,
            paddle_customer_id: data.customer_id,
            status: data.status,
            plan: getPlanName(data.items?.[0]?.price?.id),
            price_id: data.items?.[0]?.price?.id ?? null,
            current_period_end: data.current_billing_period?.ends_at ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'paddle_subscription_id' }
        );
        break;
      }

      case 'subscription.canceled':
      case 'subscription.paused': {
        await supabase
          .from('subscriptions')
          .update({ status: data.status, updated_at: new Date().toISOString() })
          .eq('paddle_subscription_id', data.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (err) {
    logger.error({
      event: 'paddle_webhook_processing_failed',
      eventType,
      subscriptionId: data?.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  logger.info({ event: 'paddle_webhook_processed', eventType, subscriptionId: data?.id, userId: data?.custom_data?.user_id });
  return NextResponse.json({ received: true }, { status: 200 });
}