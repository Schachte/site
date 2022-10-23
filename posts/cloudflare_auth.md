---
title: 'Google Cloud OAuth2 and Cloudflare Workers'
date: 'Oct 22 2022'
tags: cloud, cloudflare, google
---

# Table of contents

- [Background](#background)
- [Implementation](#implementation)
  - [Google Cloud Setup](#google-cloud-setup)
  - [Cloudflare Setup](#cloudflare-setup)
  - [Create a new Typescript Worker](#create-a-new-typescript-worker)
  - [Deploy](#deploy)
- [Understanding the internals](#understanding-the-internals)
  - [What is JWT?](#what-is-jwt)
  - [Header](#header)
  - [Claim set](#claim-set)
  - [Signature](#signature)
  - [Request access token](#request-access-token)
  - [Using the token](#using-the-token)

# Background

[Cloudflare Workers](https://developers.cloudflare.com/workers/) provide a wonderful alternative for deploying applications on the edge in a fast, cheap and reliable way. One thing I've found painful is communicating to Google Cloud Platform from within a Cloudflare Worker. This is mainly because there is a lot involved when generating the signed JWT for authenticating to the Google servers. 

After being inspired by [this Github Gist](https://gist.github.com/markelliot/6627143be1fc8209c9662c504d0ff205) I've developed a Google OAuth2 module for Cloudflare Workers to help ease the pain when authenticating to the G.

- [Module source code](https://github.com/Schachte/cloudflare-google-auth)
- [Demo](https://github.com/Schachte/cloudflare-worker-gauth-example)

Let's break down the 5 steps:

1. Create Google Cloud service account
2. Create a JSON key for the account
3. Upload encrypted key to Cloudflare Worker
4. Implement auth library
5. Deploy

# Implementation

## Google Cloud Setup

Let's begin by creating a [service account](https://cloud.google.com/iam/docs/service-accounts?authuser=1) on Google Cloud. The service account will be used on the Cloudflare Worker to authenticate itself to Google Cloud. 

Navigate to:
- IAM
	- Service Accounts
		- Create service account

From here, simply fill out the form and apply the permissions/scopes you want the account to have access to.

Within the service account page, select `keys` -> `Add Key` -> `Create new key`. Download the JSON file for this key and keep it somewhere safe.

## Cloudflare Setup

On the Cloudflare dash, navigate to the `Workers` page and create a new worker. Create a new environment variable and name it `GCP_SERVICE_ACCOUNT`. The value will be the contents of the JSON key downloaded in the previous step.

## Create a new Typescript Worker

`npx wrangler init gauth`

Select `y` to all the following:

```bash
✨ Created gauth/wrangler.toml
Would you like to use git to manage this Worker? (y/n)
✨ Initialized git repository at gauth
No package.json found. Would you like to create one? (y/n)
✨ Created gauth/package.json
Would you like to use TypeScript? (y/n)
✨ Created gauth/tsconfig.json
Would you like to create a Worker at gauth/src/index.ts?
```

Next, we will install the Google OAuth2 module for authenticating the Worker.

`npm i cloudflare-workers-and-google-oauth`

This module will give us the ability to generate a service account authentication token on the fly from within a Worker request path.


Let's crack open `src/index.ts`.


The first thing we'll do is import the library and associated interface.

```javascript
import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth'
```

Now, let's provide the appropriate type for our environment variable.

```javascript
...

// Add secret using Wrangler or the Cloudflare dash
export interface Env {
	GCP_SERVICE_ACCOUNT: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
};
```

Now that we have the skeleton of the Worker built, let's generate our OAuth token.

```javascript
...

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// https://developers.google.com/identity/protocols/oauth2/scopes
		const scopes: string[] = ['https://www.googleapis.com/auth/devstorage.full_control']
		const googleAuth: GoogleKey = JSON.parse(env.GCP_SERVICE_ACCOUNT)

		// Initialize the service
		const oauth = new GoogleAuth(googleAuth, scopes)
		const token = await oauth.getGoogleAuthToken()
	},
};

```

We define the [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) we want to authorize for. This is essentially the IAM roles that grant the account access to services on GCP.

We instantiate a new instance of the OAuth library and give it the parsed key and defined scopes. From here, we can request tokens on the fly per request. Let's show how we could retrieve an image from Google Cloud Storage.

```javascript
export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
        // https://developers.google.com/identity/protocols/oauth2/scopes
		const scopes: string[] = ['https://www.googleapis.com/auth/devstorage.full_control']
		const googleAuth: GoogleKey = JSON.parse(env.GCP_SERVICE_ACCOUNT)

		// Initialize the service
		const oauth = new GoogleAuth(googleAuth, scopes)
		const token = await oauth.getGoogleAuthToken()

        // Example with Google Cloud Storage
		const res = await fetch('https://storage.googleapis.com/storage/v1/b/MY_BUCKET/o/MY_OBJECT.png?alt=media', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'image/png',
				'Accept': 'image/png',
			},
		})

		return new Response(res.body, { headers: { 'Content-Type': 'image/png' } });
	},
};
```

As you can see, in just a few lines of code, you are already downloading images and videos from your Google Cloud account and serving them up via a Cloudflare Worker.


[View the Github repository here](https://github.com/Schachte/cloudflare-worker-gauth-example)

## Deploy

Deployment is extremely easy with [Wrangler](https://github.com/cloudflare/wrangler2).

1. `wrangler login`

2. `wrangler publish`

# Understanding the internals

We will walk through the core ideas behind the OAuth2 flow, how it works and how we're retrieving refreshed tokens on the fly on each request.

## What is JWT?

JWT (pronounced `jot`) is a token standard composed of 3 parts. 

`<HEADER>.<CLAIM_SET>.<SIGNATURE>`

Note: Each of these units are `base64` encoded independent of one another.

## Header

The header is `JSON` and contains 2 fields:
- The signing algorithm
- The data format

`{"alg":"RS256","typ":"JWT"}`

## Claim set

The `claim set` in the JWT has information about the token itself. That information can be things such as the `scopes` being requested (ie. cloud storage access, VM access, IAM access), the token issuance time, who issued it, token lifespan, etc.

Let's briefly touch on the _required_ fields notes in the `Google OAuth documentation`.

- iss: _email address of the service account_
- scope: _space delimited set of permissions that the app has_
- aud: _assertion descriptor_ `https://oauth2.googleapis.com/token`
- exp: _expiration time_
- iat: _issuance time_


Let's look at an example:
```javascript
{
  "iss": "random@developer.gserviceaccount.com",
  "scope": "https://www.googleapis.com/auth/devstorage.read_only",
  "aud": "https://oauth2.googleapis.com/token",
  "exp": 1444445555,
  "iat": 1144444555
}
```

## Signature

The signature prevents tampering, as the tokens can be passed around in public. In order to generate a signature, we only need the first two components of our JWT.

`createSignature(base64(header) + "." + base64(claimSet))`

The signing header of the JWT _must_ be `RSA` using the `SHA-256` hashing algorithm.

Example:
`{"alg":"RS256","typ":"JWT"}`

## Request access token

Now that we have our computed JWT from above, we can make the access token request against the OAuth server from Google.

Note the following URL:
`https://oauth2.googleapis.com/token`

This will be a `POST` request and require the following parameters:

- `grant_type`: `urn:ietf:params:oauth:grant-type:jwt-bearer`
- `assertion`: This is the _full_ `JWT` including the signature

```javascript
const jwtUnsigned = `${jwtHeader}.${claimset}`
const signedJwt = `${jwtUnsigned}.${await this.sign(jwtUnsigned, key)}`
const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signedJwt}`

const response = await fetch(this.googleKey.token_uri, {
		method: 'POST',
		headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
            Host: 'oauth2.googleapis.com',
		},
		body,
})
```

## Using the token

Once you make the request successfully, you will get back a JSON blob of data:

- access_token
- allowed scopes or services
- the type of the token (ie Bearer)
- when the access token will expire

From here, you can make requests to any service like `Google Cloud Storage` and just ensure there is a header present in the form of:

> `Authorization: Bearer access_token`

Thanks for reading and shoutout to [@markelliot](https://gist.github.com/markelliot)nd [@Moumouls](https://gist.github.com/Moumouls) for inspiring me to write this.

- [Module source code](https://github.com/Schachte/cloudflare-google-auth)
- [Demo](https://github.com/Schachte/cloudflare-worker-gauth-example)