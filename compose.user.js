import { readFile } from "@sanjo/read-file"
import * as path from "node:path"
import { fileURLToPath } from "url"
import { sep } from "path"
import { sep as posixSep } from "path/posix"

export async function insertLicense(compose, licensePath) {
  return (
    await readFile(
      path.join(path.dirname(fileURLToPath(import.meta.url)), licensePath),
    )
  ).replaceAll("\n", "<br>\n")
}

export function navigationItem(compose, name, path) {
  if (isActivePage(compose, path)) {
    return `<span
      href="${path}"
      class="nav-link px-2 link-secondary"
    >${name}</span>`
  } else {
    return `<a
      href="${path}"
      class="nav-link px-2 link-body-emphasis"
    >${name}</a>`
  }
}

export function isActivePage(compose, navbarItemPagePath) {
  return navbarItemPagePath === retrievePagePath(compose)
}

export function retrievePagePath(compose) {
  let path = compose.getPagePath()
  if (sep !== posixSep) {
    path = path.replaceAll(sep, posixSep)
  }
  path = "/" + path
  path = path.replace(/\/index\.html$/i, "")
  if (path === "") {
    path = "/"
  }
  if (path[path.length - 1] !== "/" && path.indexOf(".") === -1) {
    path += "/"
  }
  return path
}
