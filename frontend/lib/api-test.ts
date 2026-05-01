// API Connection Test Utility
import { api } from "./api";

export async function testAPIConnection(): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    console.log("🧪 Testing API connection...");

    // Test 1: Health check (if available)
    try {
      const health = await api.health.check();
      console.log("✅ Health check passed:", health);
    } catch (error) {
      console.warn("⚠️ Health check not available (endpoint may not exist)");
    }

    // Test 2: Get default categories (public endpoint)
    try {
      const categories = await api.categories.getDefaults();
      console.log("✅ Categories endpoint working:", categories);
      return {
        success: true,
        message: "API connection successful",
        details: { categoriesCount: Array.isArray(categories) ? categories.length : 0 },
      };
    } catch (error) {
      console.error("❌ Categories endpoint failed:", error);
      throw error;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ API connection test failed:", errorMessage);
    return {
      success: false,
      message: `API connection failed: ${errorMessage}`,
      details: error,
    };
  }
}

// Auto-test on client side in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Run test after a short delay to allow app to initialize
  setTimeout(() => {
    testAPIConnection().then((result) => {
      if (result.success) {
        console.log("✅ API Test Result:", result.message);
      } else {
        console.error("❌ API Test Result:", result.message);
      }
    });
  }, 2000);
}
