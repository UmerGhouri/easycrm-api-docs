---
title: EasyCRM API
slug: /
sidebar_position: 0
---

# EasyCRM API

## What EasyCRM is

EasyCRM is a customer portal for Salesforce. People sign in to a branded site and work with
the records shared with them — accounts, contacts, activities, files, reports and dashboards —
without needing a Salesforce licence of their own.

What each person can see is decided by the portal's own permission model: object permissions,
field access, record sharing, and company scoping on top. Somebody sees what an administrator
has given them, and nothing else.

## What the API is for

The API lets another system read that same data directly, instead of a person opening the
portal and reading it off the screen. It is the right tool when you want to pull portal data
into a warehouse, a reporting tool, a spreadsheet on a schedule, or an application of your own.

Two things are worth knowing before you start:

- **It is read-only.** The API returns records. It cannot create, change or delete anything.
- **It sees exactly what its user sees.** A key belongs to one portal user and inherits their
  permissions, so it can never read data that person could not already open in the portal. An
  administrator narrows it further by choosing which objects and fields the key may return.

## What you need before you can call it

Three values, and all three come from **your administrator** — there is no self-service sign-up:

| | |
|---|---|
| **Client ID** | identifies the key |
| **Secret** | shown to your administrator once, when the key is created |
| **Endpoint URL** | the address you send requests to, which is specific to your portal |

If you have not been given all three, ask your administrator before going further. The
[Setting up a key](./api-integration/admin-setup.md) page is written for them and lists exactly
what they need to do.

## Start here

- **[Using the API](./api-integration/using-the-api.md)** — your first request, start to finish
- **[Filters and sorting](./api-integration/filters-and-sorting.md)** — narrowing what comes back
- **[Paging](./api-integration/paging.md)** — reading more than one page of results
- **[API reference](./api/easycrm-portal-api)** — every parameter and response, with copyable samples

Administrators have two pages of their own: [Setting up a key](./api-integration/admin-setup.md)
and the [API Usage tab](./api-integration/api-usage-tab.md), which reports what each key has
been doing.
