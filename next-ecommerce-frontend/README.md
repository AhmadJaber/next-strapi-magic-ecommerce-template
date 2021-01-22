### next-strapi-magic-ecommerce-template

a basic template for creating an e-commerce website with strapi, nextjs, magic

### stacks

**nextjs**
The React Framework for Production.
Next.js gives you the best developer experience with all the features you need for production:
-> hybrid static & server rendering,
-> TypeScript support,
-> smart bundling,
-> route pre-fetching

**strapi**
Strapi is a flexible, open-source Headless CMS that gives developers the freedom to choose their favorite tools and frameworks while also allowing editors to easily manage and distribute their content.

**stripe**
Online payment processing for internet businesses. Stripe is a suite of payment APIs that powers commerce for online businesses of all sizes

**magic**
One SDK for passwordless, WebAuthn, and social login - fully customizable.

#### making authenticated request with strapi & magic

- to achieve that install a plugin in strapi, `strapi-plugin-magic` & customize some files in strapi-code(backend).
- sothat whenever we make an authenticated request, strapi will find or create proper user & seemlessly connect the frontend with backend.

> if i want to rebuild the strapi admin panel, after some change use `npm run build` or `yarn build`

- then in strapi admin there will be a option for magic, i have to put the `magic secret-key` in there.
- next i have to overwrite the default strapi permission policy. policy, will determine who the current loggedin user is. to customize strapi default behaviour, go `./extintions/user-permissions/config` & create a folder `policies` with a file `permissions.js`

- `permissions.js`, this is a strapi provided file, which we can customize. to get the default file - goto [strapi github](https://github.com/strapi/strapi). open `packages/strapi-plugin-users-permissions/config/policies/permissions.js`. copy the code & paste to my `permissions.js` file.

- add a line of code which integrates the plugin with strapi.

```js
await strapi.plugins['magic'].services['magic'].loginWithMagic(ctx);
```

- this change allows, if i make request with a valid magic `bearer-token` to strapi. strapi will add or create a user with the email that was used in magic. so in order to make an authenticated request with magic to strapi we must have a `bearer-token`. i have to add this functionality in my `AuthContext` in frontend.

- created a method to get the token & every-time the method is called, magic will issue a token for `15min`. after that it will expire.

```js
const getToken = async () => {
  try {
    const token = await magic.user.getIdToken();
    return token;
  } catch (error) {
    console.error(error.message);
  }
};
```

- now if we make a `get` request in using `postman` for testing purposes, where the request is an authenticated request because we are requesting with `bearer-token`. we will see in my `Users` collection a new loggedin user.

> so the `plugin` for magic received the request it parsed the `jwt-token(bearer-token)` and realized there is a new user & added it to the collection.

#### storing orders securely

- go to strapi-admin, create a collection-type `order`. add some fields -

  - status (Enumeration - paid, unpaid)
  - total (number - decimal)
  - checkout_session (text)
  - relation (a product has many orders)
  - relation (a user has many orders)

- create two orders for now manually in strapi, where one is related to authenticated user another is not related to that user. change the `roles` of `order` for `authenticated` user. but there is a problem, if an authenticated user send a request to strapi for all the orders. strapi will give back all the orders which are not related to them also.

- to ensure a user can only have his order related to his email, i have to modify default `order` controllers. so, go to `./api/order/controllers/order.js`, i have to modify this file.

```js
'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    const { user } = ctx.state; // this is the magic-user

    // customize the user property of ctx.query to the authenticated-user
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.order.search({
        ...ctx.query,
        user: user.id,
      });
    } else {
      entities = await strapi.services.order.find({
        ...ctx.query,
        user: user.id,
      });
    }

    return entities.map((entity) =>
      sanitizeEntity(entity, { model: strapi.models.order })
    );
  },
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.order.findOne({ id, user: user.id });
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};
```

- retrive the `orders` for loggedin user & show that in `account` page. so switch to `frontend`. First thing is to make an `authenticated` request.

#### use stripe to process payments

- i will be using `stripe hosted checkout` to provide secure, privacy complient payment solution. i will prefill the email for them and redirect them to success page.

- order processing steps -

  - first customer start the order by clicking a button. which will make a request to `strapi`, which will make a request to `stripe` to generate a `checkout-session`.
  - if the `checkout_session` is generated successfully, we will create a `order` & set it to a `unpaid` status.
  - i will then return the `checkout_session`, this is gonna be used in the frontend by `stripe sdk` to return the user to `stripe hosted checkout`.
  - once `stripe checkout` is successful i will redirect the user to `success` page. i will use this page to tell `strapi` to use the `stripe sdk` to verify the payment is processed or not.
  - if the payment is successful, we will update the `order` to paid.

- creating `checkout_session` in stripe, [checkout_sessions docs](https://stripe.com/docs/api/checkout/sessions). after that create an order.

```js
async create(ctx) {
    const { product } = ctx.request.body;

    if (!product) {
      return ctx.throw(400, "Please specify a product");
    }

    const realProduct = await strapi.services.product.findOne({
      id: product.id,
    });
    if (!realProduct) {
      return ctx.throw(404, "No product with such id");
    }

    const { user } = ctx.state;
    const BASE_URL = ctx.request.headers.origin || "http://localhost:3000";

    // checkout_session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE_URL,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: realProduct.name,
            },
            unit_amount: fromDecimalToInt(realProduct.price),
          },
          quantity: 1,
        },
      ],
    });

    // create the order
    const newOrder = await strapi.services.order.create({
      user: user.id,
      product: realProduct.id,
      total: realProduct.price,
      status: "unpaid",
      checkout_session: session.id,
    });

    // we will use session.id in the frontend
    return { id: session.id };
  },
```

- now if i make a post request with `bearer_token`, it will return the `stripe checkout_token` & if i check my `order` collection, i will see a new `unpaid` order has been added with the product i made the post request. Also authenticated user been added. the `stripe checkout_token` will be used in frontend for checkout.

- In order to `stripe` work in the frontend, i have to install `@stripe/stripe-js` package. then when the buy button is clicked, we will make a `post_request`. The response will be the `checkout_session token` & will be redirected to checkout page when we pass the token.

```js
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(STRIPE_PK);
const handleBuy = async () => {
  const stripe = await stripePromise;
  const token = await getToken();

  // get the checkout_session token
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify({ product }),
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const session = await res.json();

  // stripe.redirectToCheckout({}) will receive the session_id we passed from strapi &
  // will redirect the user to checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });
};
```

- then in `stripe_hosted checkout` page, when we fill the card-number will be redirected to the `success` page with that `checkout_session token` as `query_parameter` & this gonna allow us to verify that the order is paid & set the `status` to paid.

#### confirmation page & update order -> status

- `checkout_session token` as `query_parameter` which is attached to the order. so we use stripe-sdk to verify that checkout_session & update that order.
- to do that will create a custom-controller for `order` collection.

```js
async confirm(ctx) {
    const { checkout_session } = ctx.request.body;
    // retrive the session
    const session = await stripe.checkout.sessions.retrieve(checkout_session);

    if (session.payment_status === "paid") {
      // strapi.services.order.update(filter_object, {values})
      const updateOrder = await strapi.services.order.update(
        {
          checkout_session,
        },
        {
          status: "paid",
        }
      );

      return sanitizeEntity(updateOrder, { model: strapi.models.order });
    } else {
      // error can happen, because of the asynchoronous nature of apis
      return ctx.throw(
        400,
        "The payment wan't successful, please call support"
      );
    }
  }
```

- in-order this api to work, i have to include it to `api/order/config/routes.json`.
