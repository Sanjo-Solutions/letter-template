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

type TextGenerator = (args: {
  documentID: string
  licenseURL: string
}) => string

function generateTextGerman({
  documentID,
  licenseURL,
}: {
  documentID: string
  licenseURL: string
}) {
  return (
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
    "von Sanjo Solutions"
  )
}

function generateHTMLGerman({
  documentID,
  licenseURL,
}: {
  documentID: string
  licenseURL: string
}) {
  return (
    "Sehr geehrte Damen und Herren,<br>" +
    "<br>" +
    "hier die Links für die verschiedenen Formate:<br>" +
    `* <a href="https://docs.google.com/document/d/${documentID}/copy?usp=sharing">Google Docs</a><br>` +
    `* <a href="https://docs.google.com/document/d/${documentID}/export?format=doc">Microsoft Word Dokument</a><br>` +
    `* <a href="https://docs.google.com/document/d/${documentID}/export?format=odt">Open Document Format (auch für LibreOffice)</a><br>` +
    "<br>" +
    `Die Lizenz können sie <a href="${licenseURL}">hier</a> herunterladen.<br>` +
    "<br>" +
    "Mit freundlichen Grüßen<br>" +
    "Jonas Aschenbrenner<br>" +
    "von Sanjo Solutions"
  )
}

function generateTextEnglish({
  documentID,
  licenseURL,
}: {
  documentID: string
  licenseURL: string
}) {
  return (
    "Dear Sir or Madam,\n" +
    "\n" +
    "here are the links for the different formats:\n" +
    `* Google Docs: https://docs.google.com/document/d/${documentID}/copy?usp=sharing\n` +
    `* Microsoft Word document: https://docs.google.com/document/d/${documentID}/export?format=doc\n` +
    `* Open Document format (also for LibreOffice): https://docs.google.com/document/d/${documentID}/export?format=odt\n` +
    "\n" +
    `You can download the license here: ${licenseURL}\n` +
    "\n" +
    "Best regards\n" +
    "Jonas Aschenbrenner\n" +
    "from Sanjo Solutions"
  )
}

function generateHTMLEnglish({
  documentID,
  licenseURL,
}: {
  documentID: string
  licenseURL: string
}) {
  return (
    "Dear Sir or Madam,<br>" +
    "<br>" +
    "here are the links for the different formats:<br>" +
    `* <a href="https://docs.google.com/document/d/${documentID}/copy?usp=sharing">Google Docs</a><br>` +
    `* <a href="https://docs.google.com/document/d/${documentID}/export?format=doc">Microsoft Word document</a><br>` +
    `* <a href="https://docs.google.com/document/d/${documentID}/export?format=odt">Open Document format (also for LibreOffice)</a><br>` +
    "<br>" +
    `You can download the license <a href="${licenseURL}">here</a>.<br>` +
    "<br>" +
    "Best regards<br>" +
    "Jonas Aschenbrenner<br>" +
    "from Sanjo Solutions"
  )
}

const data = {
  de: {
    private: {
      subject: "Geschäftsbrief Vorlage (DIN 5008)",
      documentID: "17eJk9198HKYCmCGO3nKCun-Ij-u7gQhEi7MRW_2k0HU",
      licenseURL: "https://letter-template.sanjo-solutions.com/Lizenz.txt",
      generateText: generateTextGerman,
      generateHTML: generateHTMLGerman,
    },
    business: {
      subject: "Geschäftsbrief Vorlage für Unternehmen (DIN 5008)",
      documentID: "1pSzBLD4LfwIMHnPnzDSbt5-o6Vqvl5jCuLBqgES1RHQ",
      licenseURL:
        "https://letter-template.sanjo-solutions.com/Lizenz_Geschaeftlich.txt",
      generateText: generateTextGerman,
      generateHTML: generateHTMLGerman,
    },
  },
  en: {
    private: {
      subject: "Formal letter template (DIN 5008)",
      documentID: "1WIHhCpT0GKk_wh_1RthUYA6dn9k6RAsvgPPIdSkKExQ",
      licenseURL: "https://letter-template.sanjo-solutions.com/License.txt",
      generateText: generateTextEnglish,
      generateHTML: generateHTMLEnglish,
    },
    business: {
      subject: "Formal letter template for businesses (DIN 5008)",
      documentID: "1x38eC3VQUkuXIs7nSMHpTJFcsGboUDt4iF9i-lqpTOo",
      licenseURL:
        "https://letter-template.sanjo-solutions.com/License_for_businesses.txt",
      generateText: generateTextEnglish,
      generateHTML: generateHTMLEnglish,
    },
  },
}

const paymentLinkIDToData = new Map([
  // Test
  ["plink_1NtybjESBpgjLODg2xXDwECs", data.de.private],
  ["plink_1NuQxvESBpgjLODgPeMOC3wI", data.de.business],
  ["plink_1NufJeESBpgjLODgZYEgpKvv", data.en.private],
  ["plink_1NufLcESBpgjLODgVZNN1u8C", data.en.business],
  // Production
  ["plink_1Nu0lJESBpgjLODgBmZlhzGf", data.de.private],
  ["plink_1NuaZiESBpgjLODgjW8x2MyN", data.de.business],
  ["plink_1Nufg0ESBpgjLODg5WB66feX", data.en.private],
  ["plink_1NufgRESBpgjLODgi2Gto5Aw", data.en.business],
])

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY!)
const stripe = new Stripe(process.env.STRIPE_API_SECRET_KEY!, {
  apiVersion: "2023-08-16",
})

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

      if (stripeEvent.type === "checkout.session.completed") {
        const checkoutSession = stripeEvent.data.object as any
        const emailAddress = checkoutSession.customer_details.email
        const data2 = paymentLinkIDToData.get(checkoutSession.payment_link)
        if (data2) {
          await sendMail({
            to: emailAddress,
            ...data2,
          })
        } else {
          console.error(
            `Payment link ID has no data: ${checkoutSession.payment_link}, checkout session ID: ${checkoutSession.id}`,
          )
        }
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
  subject,
  generateText,
  generateHTML,
  documentID,
  licenseURL,
}: {
  to: string
  subject: string
  generateText: TextGenerator
  generateHTML: TextGenerator
  documentID: string
  licenseURL: string
}) {
  const message = {
    to,
    from: {
      name: "Sanjo Solutions",
      email: "support@sanjo-solutions.com",
    },
    subject,
    text: generateText({ documentID, licenseURL }),
    html: generateHTML({ documentID, licenseURL }),
  }
  await sendgridMail.send(message)
}
