import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

interface Body {
  title: string;
  price: number;
  quantity: number;
}

const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const preference = {
      items: [
        {
          id: Date.now().toString(),
          title: body.title ?? 'Order Payment',
          unit_price: body.price,
          quantity: body.quantity,
        },
      ],
      back_urls: {
        success: `${process.env.BASE_URL!}`,
        failure: `${process.env.BASE_URL!}`,
        pending: `${process.env.BASE_URL!}`,
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 3,
      },
    };

    const response = await new Preference(mercadopago).create({ body: preference });
    return NextResponse.json(response);
  } catch (_error) {
    // console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
