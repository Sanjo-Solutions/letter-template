import { readFile } from "@sanjo/read-file"
import * as path from "node:path"
import { fileURLToPath } from "url"

export async function insertLicense(compose, licensePath) {
  return (
    await readFile(
      path.join(path.dirname(fileURLToPath(import.meta.url)), licensePath),
    )
  ).replaceAll("\n", "<br>\n")
}
