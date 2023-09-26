// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Stripe from "stripe"
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda"
import sendgridMail from "@sendgrid/mail"

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_API_SECRET_KEY?: string
      STRIPE_WEBHOOK_SECRET_KEY?: string
      SENDGRID_API_KEY?: string
    }
  }
}

const data = {
  private: {
    documentID: "1Rz2qY3GBsNASEFSUmR6RHCmiEklPyesxeNYG4hvIdJY",
    licenseURL: "https://letter-template.sanjo-solutions.com/Lizenz.txt",
  },
  business: {
    documentID: "1pJ9snk8Nk2qWKEZH_wG7XOaLwH9D4TZrLpaiyo4crT4",
    licenseURL:
      "https://letter-template.sanjo-solutions.com/Lizenz_Geschaeftlich.txt",
  },
}

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY!)
const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY!, {
  apiVersion: "2023-08-16",
})

// TODO: Handle also purchase of English version
export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  if (event.body) {
    const signature = event.headers["stripe-signature"]
    if (signature) {
      let stripeEvent: Stripe.Event
      try {
        stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET_KEY!,
        )
      } catch (error: any) {
        console.error(error)
        return {
          statusCode: 400,
          body: `Webhook Error: ${error.message}`,
        }
      }

      const paymentIntent = stripeEvent.data.object as any
      if (stripeEvent.type === "payment_intent.succeeded") {
        const emailAddress = paymentIntent.receipt_email
        const data2 =
          data[paymentIntent.amount === 2499 ? "business" : "private"]
        await sendMail({
          to: emailAddress,
          ...data2,
        })
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true }),
      }
    } else {
      return {
        statusCode: 400,
        body: "stripe-signature header missing",
      }
    }
  } else {
    return {
      statusCode: 400,
      body: "Body empty",
    }
  }
}

async function sendMail({
  to,
  documentID,
  licenseURL,
}: {
  to: string
  documentID: string
  licenseURL: string
}) {
  // TODO: English version

  const message = {
    to,
    from: {
      name: "Sanjo Solutions",
      email: "support@sanjo-solutions.com",
    },
    subject: "Geschäftsbrief Vorlage (DIN 5008)",
    text:
      "Sehr geehrte Damen und Herren,\n" +
      "\n" +
      "hier die Links für die verschiedenen Formate:\n" +
      `* Google Docs: https://docs.google.com/document/d/${documentID}/copy?usp=sharing\n` +
      `* Microsoft Word Dokument: https://docs.google.com/document/d/${documentID}/export?format=doc\n` +
      `* Open Document Format (auch für LibreOffice): https://docs.google.com/document/d/${documentID}/export?format=odt\n` +
      "\n" +
      `Die Lizenz können sie hier herunterladen: ${licenseURL}\n` +
      "\n" +
      "Mit freundlichen Grüßen\n" +
      "Jonas Aschenbrenner\n" +
      "von Sanjo Solutions",
    html:
      "Sehr geehrte Damen und Herren,<br>" +
      "<br>" +
      "hier die Links für die verschiedenen Formate:<br>" +
      `* <a href="https://docs.google.com/document/d/${documentID}/copy?usp=sharing">Google Docs</a><br>` +
      `* <a href="https://docs.google.com/document/d/${documentID}/export?format=doc">Microsoft Word Dokument</a><br>` +
      `* <a href="https://docs.google.com/document/d/${documentID}/export?format=odt">Open Document Format (auch für LibreOffice)</a><br>` +
      "<br>" +
      "Mit freundlichen Grüßen<br>" +
      "Jonas Aschenbrenner<br>" +
      "von Sanjo Solutions",
  }
  await sendgridMail.send(message)
}
