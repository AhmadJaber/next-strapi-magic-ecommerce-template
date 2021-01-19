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
