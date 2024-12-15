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

## Get account info

```JS
const BithompXRPL = require("@bithomp/xrpl-api");

// setup connection
const config = [
  {
    "url": "wss://xrplcluster.com",
    "type": "regular,history,gateway_balances,last_close,manifest,payment,submit",
    "connectionTimeout": 10000
  },
  {
    "url": "wss://s1.ripple.com",
    "type": "regular,history,payment,submit",
    "connectionTimeout": 10000
  },,
  {
    "url": "wss://s2.ripple.com",
    "type": "regular,history,payment,submit",
    "connectionTimeout": 10000
  },
  {
    "url": "wss://s2-clio.ripple.com",
    "type": "clio,account_objects",
    "connectionTimeout": 10000
  }
];

// Global setup for all connections, if you have multiple connections, like in example, the library will use them by type and(or) by better response time
BithompXRPL.Client.setup(config);

// connect to all servers
await BithompXRPL.Client.connect();

// send request
const accountInfo = await BithompXRPL.Client.getAccountInfo("rsuUjfWxrACCAwGQDsNeZUhpzXf1n1NK5Z");

// when complete, disconnect
BithompXRPL.Client.disconnect();
```

## Generate Keys

Generate two sets of keys, to use for validator secrets, and to use for signing secrets.

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

## Create Validator List version 1

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

## Create Validator List version 2

_Setup connection_, it is required to get validators details from the ledger.

```JS
const BithompXRPL = require("@bithomp/xrpl-api");
// setup connection
const config = [
  {
    // this connection will be used to get validators details from the ledger, use web socket with connection to network you are building list for (mainnet, testnet, devnet, etc.)
    "url": "wss://xrplcluster.com",
    "connectionTimeout": 10000
  }
];
BithompXRPL.Client.setup(config);

// connect
await BithompXRPL.Client.connect();

// validator(master) secrets, should not belong to any validators keys.
// can be any ed25519 (publicKey starts on `ED`) or secp256k1 could be used,
// can ne generated with BithompXRPL.Validator.generateSecrets() or by generateSeed from ripple-keypairs
const vk = {
  privateKey: "p__________________________",
  publicKey: "ED________________________________",
};

// signing secrets, should not belong to any validators keys and should be different from vk.
// can be any ed25519 (publicKey starts on `ED`) or secp256k1 could be used,
// can ne generated with BithompXRPL.Validator.generateSecrets() or by generateSeed from ripple-keypairs
const sk = {
  privateKey: "p__________________________",
  publicKey: "ED_______________________________",
};

// validator list, public addresses, they have to be available on the ledger
// for accessing to manifest data (it will be stored in a blob),
// the address should start with `n`
const publishBlobCurrent = {
  sequence: 1, // sequence number
  expiration: 1696508603,
  validatorsPublicKeys: ["nHUFE9prPXPrHcG3SkwP1UzAQbSphqyQkQK9ATXLZsfkezhhda3p"],
};
const publishBlobFuture = {
  sequence: 2, // sequence number
  effective: 1696508603, // optional in unixtime (seconds)
  expiration: 1723620871, // in unixtime (seconds)
  validatorsPublicKeys: ["nHB8QMKGt9VB4Vg71VszjBVQnDW3v3QudM4DwFaJfy96bj4Pv9fA"],
};
const vl = await BithompXRPL.Client.createVLv2(vk, sk, [publishBlob, publishBlobFuture]);

// vl will contain the signed validator list with
// {
//   "blobs-v2": "...",
//   "manifest": "...", // signed with vk.privateKey and sk.privateKey
//   "version": 2,
//   "public_key": "..." // vk.publicKey
// }

// NOTE: to be able rippled to accept the validator list, you have to add validator(master) public key
// to [validator_list_keys] in rippled.cfg

//  disconnect
BithompXRPL.Client.disconnect();
```

## Decode NFTokenID

```JS
const BithompXRPL = require("@bithomp/xrpl-api");

const nftokenID = "000861A8A7C507A12088BF6A6BB62BAFEE9CDAABA2961DB216E5DA9C00000001";
const decoded = BithompXRPL.Models.parseNFTokenID(nftokenID);
// decoded will contain
// {
//   "NFTokenID: "000861A8A7C507A12088BF6A6BB62BAFEE9CDAABA2961DB216E5DA9C00000001",
//   "Flags": 8,
//   "TransferFee": 25000,
//   "Issuer": "rGJn1uZxDX4ksxRPYuj2smP7ZshdwjeSTG",
//   "NFTokenTaxon": 0,
//   "Sequence": 1,
// }
```

## Encode NFTokenID

```JS
const BithompXRPL = require("@bithomp/xrpl-api");

const flags = 11;
const transferFee = 3140;
const issuer = "rNCFjv8Ek5oDrNiMJ3pw6eLLFtMjZLJnf2";
const nftokenTaxon = 146999694;
const sequence = 3429;

// NOTE: This function is not minting NFTokenID, it is just encoding it from the data provided,
// can be used if you want to test something, check if the NFTokenID is valid, or predict the NFTokenID before minting
const result = BithompXRPL.Models.buildNFTokenID(flags, transferFee, issuer, nftokenTaxon, sequence);
// result will contain NFTokenID
// "000B0C4495F14B0E44F78A264E41713C64B5F89242540EE2BC8B858E00000D65"
```
