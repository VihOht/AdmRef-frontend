import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Main route - protected home

  index("routes/home.tsx"),

  // Auth routes
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("verify", "routes/verify_email.tsx"),
  route("dashboard/:accountId", "routes/dashboard.tsx"),

  
] satisfies RouteConfig;
