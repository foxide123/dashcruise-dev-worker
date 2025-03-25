import Stripe from "stripe";

type StripeParams = {
	amount: string;
}

export default {
  async fetch(request: Request, env: {STRIPE_SECRET_KEY: string}): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { amount } = (await request.json()) as StripeParams;

	const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
		//eslint-disable-next-line
		apiVersion: "2025-02-24.acacia; custom_checkout_beta=v1" as any,
	  });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: "https://dashcruisedev.com",
      cancel_url: "https://dashcruisedev.com",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            product_data: { name: "Website Plan" },
            recurring: { interval: "month" },
            unit_amount: Math.round(Number(amount) * 100),
          },
        },
      ],
    });

    return Response.json({ sessionId: session.id });
  },
};
