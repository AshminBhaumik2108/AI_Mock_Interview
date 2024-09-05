import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = "AIzaSyDDwEOu3V_QsyO5TX42VwnBTN8WSbm9rRY"; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
    threshold: HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED,
  },
  // Add more safety settings if required
];

// Predefined history session
const predefinedHistory = [
  {
    role: "user",
    parts: [
      { text: "{\n  \"questions\": [\n    {\n      \"question\": \"Place your question here\",\n      \"answer\": \"Place your answer here\"\n    },\n    {\n      \"question\": \"Place your question here\",\n      \"answer\": \"Place your answer here\"\n    },  {\n      \"question\": \"Place your question here\",\n      \"answer\": \"Place your answer here\"\n    },  {\n      \"question\": \"Place your question here\",\n      \"answer\": \"Place your answer here\"\n    },  {\n      \"question\": \"Place your question here\",\n      \"answer\": \"Place your answer here\"\n    },\n  ]\n}\n\nFormat of the question should be like above\n" },
      { text: "Job Position: Data Engineer, Job Description: Python, Company Name: Amazon, Experience: 2, Depends on the Job Position, Job Description, & Years of Experience give us 5 Interview Questions along with Answers in JSON format, Give us question and Answer field in JSON" },
    ],
  },
  {
    role: "model",
    parts: [
      { text: "```json\n{\n  \"questions\": [\n    {\n      \"question\": \"Describe a time you had to deal with a large dataset that was too big to fit into memory. How did you approach the problem?\",\n      \"answer\": \"I've encountered this in projects involving analyzing user activity logs. My approach was to use techniques like data partitioning and distributed processing. I divided the data into smaller chunks that could be processed individually, then aggregated the results. Libraries like Dask or Spark were instrumental in handling the distributed processing and parallel computation.\"\n    },\n    {\n      \"question\": \"Explain the difference between a JOIN and a UNION operation in SQL. Provide an example of when each operation would be used.\",\n      \"answer\": \"A JOIN combines rows from two tables based on a shared column. For instance, joining a customer table with an order table on the 'customer_id' column would retrieve information about customers and their orders. A UNION merges results from two queries with compatible column structures, creating a single dataset. An example would be combining a query for active users with a query for inactive users to get a complete user list.\"\n    },\n    {\n      \"question\": \"How would you design a system to handle real-time data ingestion and processing for a large-scale e-commerce website?\",\n      \"answer\": \"I'd use a distributed streaming platform like Apache Kafka or Amazon Kinesis to ingest real-time data from various sources, such as user actions, product updates, and payment events. For processing, I'd implement a streaming pipeline using frameworks like Apache Flink or Spark Streaming. This pipeline would analyze the data in real-time, generating insights and driving features like personalized recommendations or fraud detection.\"\n    },\n    {\n      \"question\": \"What are your preferred Python libraries for data manipulation and analysis, and why?\",\n      \"answer\": \"My go-to libraries are Pandas for data manipulation and analysis, NumPy for numerical computing, and Scikit-learn for machine learning. Pandas excels in data cleaning, transformation, and aggregation, offering a DataFrame structure that makes data manipulation intuitive. NumPy provides efficient array operations, which are crucial for numerical calculations. Scikit-learn offers a comprehensive set of machine learning algorithms and tools for building predictive models.\"\n    },\n    {\n      \"question\": \"Describe your experience with cloud-based data warehousing solutions like AWS Redshift or Snowflake. How have you used them in past projects?\",\n      \"answer\": \"In previous projects, I've extensively used AWS Redshift for data warehousing. I've designed and implemented data pipelines to load and transform data from various sources into Redshift tables. I've also optimized query performance by using techniques like data partitioning, sorting, and indexing. I'm familiar with Redshift's features like Spectrum, which enables querying data in Amazon S3, and its integration with other AWS services.\"\n    }\n  ]\n}\n```" },
    ],
  },
];

const chatSession = model.startChat({
  generationConfig,
  history: predefinedHistory,
  // safetySettings,
});

export default chatSession;
