import type { APIGatewayProxyHandlerV2 } from "aws-lambda"
import express from "express"
import { handler } from "./sendProduct.js"

const app = express()

app.use(express.text({ type: "application/json" }))

app.post("/sendProduct", convertLambdaHandlerToExpressHandler(handler))

let port = 8080
app.listen(port, function () {
  console.log(`Listening at http://localhost:${port}.`)
})

function convertLambdaHandlerToExpressHandler(
  handler: APIGatewayProxyHandlerV2,
): (request: any, response: any) => void {
  return async function (request, response) {
    let result: any = undefined
    try {
      result = await handler(request, null!, null!)
    } catch (error: any) {
      console.error(error)
      response.status(500).end()
    }
    if (result) {
      if (result.statusCode) {
        response.status(result.statusCode)
      }
      if (result.body) {
        console.log("body", result.body)
        response.send(result.body)
      }
      response.end()
    } else {
      response.status(200).end()
    }
  }
}
