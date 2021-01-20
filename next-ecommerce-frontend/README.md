#### making authenticated request with strapi & magic

-> to achieve that install a plugin in strapi, `strapi-plugin-magic` & customize some files in strapi-code(backend).
-> sothat whenever we make an authenticated request, strapi will find or create proper user & seemlessly connect the frontend with backend.

> if i want to rebuild the strapi admin panel, after some change use `npm run build` or `yarn build`

-> then in strapi admin there will be a option for magic, i have to put the `magic secret-key` in there.
-> next i have to overwrite the default strapi permission policy. policy, will determine who the current loggedin user is. to customize strapi default behaviour, go `./extintions/user-permissions/config` & create a folder `policies` with a file `permissions.js`

-> `permissions.js`, this is a strapi provided file, which we can customize. to get the default file - goto [strapi github](https://github.com/strapi/strapi). open `packages/strapi-plugin-users-permissions/config/policies/permissions.js`. copy the code & paste to my `permissions.js` file.

-> add a line of code which integrates the plugin with strapi.

```js
await strapi.plugins['magic'].services['magic'].loginWithMagic(ctx);
```

-> this change allows, if i make request with a valid magic `bearer-token` to strapi. strapi will add or create a user with the email that was used in magic. so in order to make an authenticated request with magic to strapi we must have a `bearer-token`. i have to add this functionality in my `AuthContext` in frontend.

-> created a method to get the token & every-time the method is called, magic will issue a token for `15min`. after that it will expire.

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

-> now if we make a `get` request in using `postman` for testing purposes, where the request is an authenticated request because we are requesting with `bearer-token`. we will see in my `Users` collection a new loggedin user.

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

- creating `checkout_session` in stripe, [checkout_sessions docs](https://stripe.com/docs/api/checkout/sessions).
