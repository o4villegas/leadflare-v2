import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("createCampaign", "routes/createCampaign.tsx"),
  // Add other routes here as you create them:
  // route("generateCreative", "routes/generateCreative.tsx"),
  // route("campaignManager", "routes/campaignManager.tsx"),
] satisfies RouteConfig;
