# @Bithomp/xrpl-api

A Bithomp JavaScript/TypeScript library for interacting with the XRP Ledger
Library designed to be a single point of access to the XRP Ledger. It uses multiple connections to the XRP Ledger and selects the best one for the request. If the connection is lost, the library will automatically reconnect.

The library also supports the creation of a validator list.

In an existing project (with `package.json`), install `@bithomp/xrpl-api`:

```Shell
# install package
$ npm install --save @bithomp/xrpl-api
```

# Examples of use

## Generate Keys

Generate two sets of keys, one for validator secrets, and another for signing secrets.

```JS
const { Validator } = require("@bithomp/xrpl-api");

async function generateValidatorKeys() {
  // Generate validator secrets using ed25519 keypair
  const validatorKeys = Validator.generateSecrets();

  console.log(validatorKeys)

}

// Run the function
generateValidatorKeys();
```

## Create Validator List

_Setup connection_, it is required to get validators details from the ledger.

```JS
import { Client } from "@bithomp/xrpl-api";  // Use import instead of require
import fs from 'fs'; // Import the file system module

// Setup connection
const config = [
  {
    url: "wss://s1.ripple.com",
    connectionTimeout: 10000
  }
];

Client.setup(config);

// Wrap everything inside an async function
(async () => {
  try {
    // Connect
    await Client.connect();

    // Validator secrets
    const vk = {
      privateKey: "p__________________________",
      publicKey: "ED________________________________",
    };

    // Signing secrets
    const sk = {
      privateKey: "p__________________________",
      publicKey: "ED________________________________",
    };

    // Validator list, public addresses, examples to be replaced
    const validators = [
      "nHUpDEZX5Zy9auiu4yhDmhirNu6PyB1LvzQEL9Mxmqjr818w663q",
      "nHDB2PAPYqF86j9j3c6w1F1ZqwvQfiWcFShZ9Pokg9q4ohNDSkAz",
      "nHU3AenyRuJ4Yei4YHkh6frZg8y2RwXznkMAomUE1ptV5Spvqsih",
      "nHUfxETNHsA9reyYCVYwNztEbifMg6U9YUdcgVvzMwGNpphKSSf6",
      "nHUwGQrfZfieeLFeGRdGnAmGpHBCZq9wvm5c59wTc2JhJMjoXmd8",
      "nHBWa56Vr7csoFcCnEPzCCKVvnDQw3L28mATgHYQMGtbEfUjuYyB",
      "nHUfPizyJyhAJZzeq3duRVrZmsTZfcLn7yLF5s2adzHdcHMb9HmQ",
      "nHUrUNXCy4DgPPNABX9C6mUctpoq7CwgLKAUxjw6zYtTfiqsj1ew",
      "nHU2k8Po4dgygiQUG8wAADMk9RqkrActeKwsaC9MdtJ9KBvcpVji",
      "nHUdjQgg33FRu88GQDtzLWRw95xKnBurUZcqPpe3qC9XVeBNrHeJ",
      "nHUXeusfwk61c4xJPneb9Lgy7Ga6DVaVLEyB29ftUdt9k2KxD6Hw",
      "nHUpDPFoCNysckDSHiUBEdDXRu2iYLUgYjTzrj3bde5iDRkNtY8f",
      "nHUY14bKLLm72ukzo2t6AVnQiu4bCd1jkimwWyJk3txvLeGhvro5",
      "nHUVPzAmAmQ2QSc4oE1iLfsGi17qN2ado8PhxvgEkou76FLxAz7C",
      "nHU4bLE3EmSqNwfL4AP1UZeTNPrSPPP6FXLKXo2uqfHuvBQxDVKd",
      "nHBVACxZaNbUjZZkBfj7gRxF3xgG2vbcP4m48KzVwntdTogi5Tfs",
      "nHUge3GFusbqmfYAJjxfKgm2j4JXGxrRsfYMcEViHrFSzQDdk5Hq",
      "nHUvcCcmoH1FJMMC6NtF9KKA4LpCWhjsxk2reCQidsp5AHQ7QY9H",
      "nHUDpRzvY8fSRfQkmJMqjmVSaFmMEVxBNn2tNQy5VAhFJ6is6GFk",
      "nHUcNC5ni7XjVYfCMe38Rm3KQaq27jw7wJpcUYdo4miWwpNePRTw",
      "nHB8QMKGt9VB4Vg71VszjBVQnDW3v3QudM4DwFaJfy96bj4Pv9fA",
      "nHUtmbn4ALrdU6U8pmd8AMt4qKTdZTbYJ3u1LHyAzXga3Zuopv5Y",
      "nHUED59jjpQ5QbNhesXMhqii9gA8UfbBmv3i5StgyxG98qjsT4yn",
      "nHUr8EhgKeTc9ESNt4nMYzWC2Pu7GgRHMRTsNEyGBTCfnHPxmXcm",
      "nHUFE9prPXPrHcG3SkwP1UzAQbSphqyQkQK9ATXLZsfkezhhda3p",
      "nHBidG3pZK11zQD6kpNDoAhDxH6WLGui6ZxSbUx7LSqLHsgzMPec",
      "nHBgyVGAEhgU6GoEqoriKmkNBjzhy6WJhX9Z7cZ71yJbv28dzvVN",
      "nHUpcmNsxAw47yt2ADDoNoQrzLyTJPgnyq16u6Qx2kRPA17oUNHz",
      "nHUUgpUVNxXfxkkoyh2QDjfLfHapcut8gYwKeShnJYd3SdPui19A",
      "nHUFCyRCrUjvtZmKiLeF8ReopzKuUoKeDeXo3wEUBVSaawzcSBpW",
      "nHDH7bQJpVfDhVSqdui3Z8GPvKEBQpo6AKHcnXe21zoD4nABA6xj",
      "nHULqGBkJtWeNFjhTzYeAsHA3qKKS7HoBh8CV3BAGTGMZuepEhWC",
      "nHUq9tJvSyoXQKhRytuWeydpPjvTz3M9GfUpEqfsg9xsewM7KkkK",
      "nHUryiyDqEtyWVtFG24AAhaYjMf9FRLietbGzviF3piJsMm9qyDR",
      "nHUbgDd63HiuP68VRWazKwZRzS61N37K3NbfQaZLhSQ24LGGmjtn",
    ];
    const sequence = 1; // sequence number
    const expiration = 1756598400; // in unixtime (seconds)
    const vl = await Client.createVL(vk, sk, sequence, expiration, validators);

    // Format the output as JSON
    const outputJson = JSON.stringify(vl, null, 2);  

    // Write the output to a .json file
    fs.writeFileSync('index.json', outputJson, 'utf8');

    // Disconnect
    await Client.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
})();
```
## Recommended Practices

- Use a dedicated Linux machine that will only be used for publishing, signing and updating the UNL
- Paper backup only (no digital backup) at maybe two places, or split between 6 trusted people
- In case of an emergency (loss, leak, etc), notify validators/stakeholders immediately
