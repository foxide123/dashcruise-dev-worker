import Stripe from "stripe";

type StripeLocale = 'auto' | 'en' | 'de';

type StripeParams = {
	amount: string;
  currency: string;
  language: StripeLocale;
  planName: string;
}

export default {
  async fetch(request: Request, env: {STRIPE_SECRET_KEY: string}): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { amount, currency, language, planName } = (await request.json()) as StripeParams;

	const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		//eslint-disable-next-line
		apiVersion: "2025-02-24.acacia; custom_checkout_beta=v1" as any,
	  });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `https://dashcruisedev.com/${language}/subscription/success?session_id={CHECKOUT_SESSION_ID}}`,
      cancel_url: "https://dashcruisedev.com/en",
      allow_promotion_codes: true,
      locale: language,
      //important !!! ensures customer is created in the Stripe system
      customer_creation: 'always',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency,
            product_data: { name: "Website Plan" },
            recurring: { interval: "month" },
            unit_amount: Math.round(Number(amount) * 100),
          },
        },
      ],
      metadata: {
        plan: planName
      }
    });

    return Response.json({ sessionId: session.id });
  },
};
