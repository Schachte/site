---
title: 'x86 Hacking For Programmers'
date: 'Oct 16 2022'
tags: algorithms, recursion
mode: draft
---

## Authentication Flow

### Understanding implementation

There are a series of steps required to authorize a service account to perform some operation against your services on GCP. It's important to note that the flow itself should be agnostic to the cloud provider as OAuth2 is a widely agreed upon specification

#### Service account preparation

1. Create a [service account](https://cloud.google.com/iam/docs/understanding-service-accounts) with explicit service permissions.
2. Create a new public/private key pair for the service account and download it to a secure location.
3. Make a metal note of the email address they give you for the service account, we will reference this when making requests.
4. Assign the [scopes](https://developers.google.com/identity/protocols/oauth2/scopes) you're interested in the service account having access to.

#### Understanding authorization & authentication flow

TOOD: Insert a photo here
1. Create a JSON Web Token (JWT) which will contain

- header
- claim set
- signature

Don't worry if you're unfamiliar with these concepts, we will discuss what they are shortly.

2. Request an access token from the `Google OAuth 2.0` authorization server

3. Parse and handle the JSON response from the auth server for subsequent requests against our cloud provider services.

# Creating a JWT token

If you're not familiar with `JWT`, let's briefly discuss. All JWT tokens are composed of 3 parts, delimited by a `.`. 

`<HEADER>.<CLAIM_SET>.<SIGNATURE>`

Note: Each of these units are `base64` encoded independent of one another.

## Header

The header is `JSON` and contains 2 fields:
- The signing algorithm
- The data format

`{"alg":"RS256","typ":"JWT"}`

## Claim Set

The `claim set` in the JWT has information about the token itself. That information can be things such as the `scopes` being requested (ie. cloud storage access, VM access, IAM access), the token issuance time, who issued it, token lifespan, etc.

Let's briefly touch on the _required_ fields notes in the `Google OAuth documentation`. 

- iss: _email address of the service account_
- scope: _space delimited set of permissions that the app has_
- aud: _assertion descriptor_ `https://oauth2.googleapis.com/token`
- exp: _expiration time_
- iat: _issuance time_


Let's look at an example:
```
{
  "iss": "761326798069-r5mljlln1rd4lrbhg75efgigp36m78j5@developer.gserviceaccount.com",
  "scope": "https://www.googleapis.com/auth/devstorage.read_only",
  "aud": "https://oauth2.googleapis.com/token",
  "exp": 1328554385,
  "iat": 1328550785
}
```

## Signature

The signature prevents tampering, as the tokens can be passed around in public safely and securely. In order to generate a signature, we only need the first two components of our JWT.

`createSignature(base64(header) + "." + base64(claimSet))`

The signing header of the JWT _must_ be `RSA` using the `SHA-256` hashing algorithm. 

Example:
`{"alg":"RS256","typ":"JWT"}`

# Request Access Token

Now that we have our computed JWT from above, we can make the access token request against the OAuth server from Google.

Note the following URL:
`https://oauth2.googleapis.com/token`

This will be a `POST` request and require the following parameters:

- `grant_type`: `urn:ietf:params:oauth:grant-type:jwt-bearer`
- `assertion`: This is the _full_ `JWT` including the signature

```
POST /token HTTP/1.1
Host: oauth2.googleapis.com
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI3NjEzMjY3OTgwNjktcjVtbGpsbG4xcmQ0bHJiaGc3NWVmZ2lncDM2bTc4ajVAZGV2ZWxvcGVyLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzY29wZSI6Imh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvcHJlZGljdGlvbiIsImF1ZCI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi90b2tlbiIsImV4cCI6MTMyODU3MzM4MSwiaWF0IjoxMzI4NTY5NzgxfQ.ixOUGehweEVX_UKXv5BbbwVEdcz6AYS-6uQV6fGorGKrHf3LIJnyREw9evE-gs2bmMaQI5_UbabvI4k-mQE4kBqtmSpTzxYBL1TCd7Kv5nTZoUC1CmwmWCFqT9RE6D7XSgPUh_jF1qskLa2w0rxMSjwruNKbysgRNctZPln7cqQ
```

We will implement this `POST` in _Javascript_ shortly when developing our module.

### Using the token

Once you make the request successfully, you will get back a JSON blob of data:

- access_token 
- allowed scopes or services
- the type of the token (ie Bearer)
- when the access token will expire

From here, you can make requests to any service like `Google Cloud Storage` and just ensure there is a header present in the form of:

`Authorization: Bearer access_token`

# Dissecting Service Account JSON

The service account JSON is comprised of many fields, but the format isn't JWT, so what now?


Within the downloaded key you obtained from the beginning, you'll notice there is a private key with some interesting properties:

- PEM-encoded
- RSA

This is great because this will be the key we use to generate the signature within our JWT.

I mentioned that we have a `PEM` encoded key, but the standard encoding we need is a `PKCS #8` key. Luckily, `PEM` is `PKCS #8` with the addition of a `header`, `footer` and the fact that the entire key is `base64` encoded.

Let's parse the `PEM` key.

1. Strip out the header and footer
2. base64 decode the payload
3. tada!




