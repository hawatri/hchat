export default {
  providers: [
    {
      // For Clerk + Convex, use the JWT issuer domain from Clerk, not the frontend API URL
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
}