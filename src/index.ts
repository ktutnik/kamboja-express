export { ExpressEngine } from "./express-engine"
export { MiddlewareActionResult } from "./middleware-action-result"
import { Express, MiddlewareInterceptor } from "./middleware-interception"
const express = new Express()
export { express, MiddlewareInterceptor }