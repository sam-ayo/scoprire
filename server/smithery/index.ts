import * as dotenv from "dotenv";

dotenv.config();

const registries = async () => {
  const response = await fetch(
    "https://registry.smithery.ai/servers?q=github",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SMITHERY_API_KEY}`,
      },
    }
  );
  const result = await response.json();
  console.log("Response: ", result);
};

registries();
