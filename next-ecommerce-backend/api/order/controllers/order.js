"use strict";

const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);
/**
 * require('stripe'), returns a function which will receive the STRIPE_SK
 * this way i am injecting the secret_key to stripe_sdk
 */

/**
 * given a dollar amount return the amount in cents
 * stripe only accepts cents
 * @param {number} number
 */
const fromDecimalToInt = (number) => parseInt(number * 100);

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {
  /**
   * Retrieve records.
   * only returns orders that belongs to the loggedin user
   * @return {Array}
   */
  async find(ctx) {
    const { user } = ctx.state; // this is the magic-user

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
  /**
   * Retrieve a record.
   * returns one order that belongs to the loggedin user
   * @return {Object}
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const { user } = ctx.state;

    const entity = await strapi.services.order.findOne({ id, user: user.id });
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
  /**
   * creates an order & sets up the stripe checkout_session for the forntend
   * @param {any} ctx
   */
  async create(ctx) {
    const { product } = ctx.request.body;
    console.log("product", product);

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
};
