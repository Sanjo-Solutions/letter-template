// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Stripe from "stripe"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda"

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_API_SECRET_KEY: string
      STRIPE_WEBHOOK_SECRET_KEY: string
    }
  }
}

const ses = new SESClient({ region: "eu-central-1" })
const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY, {
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
          process.env.STRIPE_WEBHOOK_SECRET_KEY,
        )
      } catch (error: any) {
        return {
          statusCode: 400,
          body: `Webhook Error: ${error.message}`,
        }
      }

      const paymentIntent = stripeEvent.data.object as any
      if (stripeEvent.type === "payment_intent.succeeded") {
        const emailAddress = paymentIntent.receipt_email
        await sendMail({ to: emailAddress })
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

async function sendMail({ to }: any) {
  // TODO: English version

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Data:
            "Sehr geehrte Damen und Herren,\n" +
            "\n" +
            "hier die Links für die verschiedenen Formate der Geschäftsbrief Vorlage (DIN 5008):\n" +
            "* Google Docs: https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/copy?usp=sharing\n" +
            "* Microsoft Word Dokument: https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/export?format=doc\n" +
            "* Open Document Format: https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/export?format=odt\n" +
            "\n" +
            "Mit freundlichen Grüßen\n" +
            "Jonas Aschenbrenner",
          Charset: "UTF-8",
        },
        Html: {
          Data:
            "Sehr geehrte Damen und Herren,<br>" +
            "<br>" +
            "hier die Links für die verschiedenen Formate der Geschäftsbrief Vorlage (DIN 5008):<br>" +
            '* <a href="https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/copy?usp=sharing">Google Docs</a><br>' +
            '* <a href="https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/export?format=doc">Microsoft Word Dokument</a><br>' +
            '* <a href="https://docs.google.com/document/d/1xAAGrhdFho0eZIqAjiMKx2Aw_JtSMChmyYrOiGfoHrk/export?format=odt">Open Document Format</a><br>' +
            "<br>" +
            "Mit freundlichen Grüßen<br>" +
            "Jonas Aschenbrenner",
          Charset: "UTF-8",
        },
      },

      Subject: { Data: "Geschäftsbrief Vorlage (DIN 5008)", Charset: "UTF-8" },
    },
    Source: "no-reply@sanjo-solutions.com",
  })

  await ses.send(command)
}
