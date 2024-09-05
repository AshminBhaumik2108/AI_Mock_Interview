/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:KMfhE05wLiOR@ep-young-silence-a5rq4yve-pooler.us-east-2.aws.neon.tech/ai-interview-mocker?sslmode=require',
    }
  };