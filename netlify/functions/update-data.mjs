export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
  };

  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  // السماح بـ POST فقط
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "POST فقط"
      }),
      {
        status: 405,
        headers
      }
    );
  }

  try {
    const body = await req.json();

    // التأكد من وجود البيانات
    if (!body.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "لم يتم إرسال data"
        }),
        {
          status: 400,
          headers
        }
      );
    }

    // قراءة GitHub Token من Netlify Environment Variables
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GITHUB_TOKEN غير موجود"
        }),
        {
          status: 500,
          headers
        }
      );
    }

    // بيانات المستودع
    const owner = "time110943";
    const repo = "2026";
    const path = "data.json";
    const branch = "main";

    // رابط GitHub API
    const apiUrl =
      https://api.github.com/repos/${owner}/${repo}/contents/${path};

    // قراءة data.json الحالية للحصول على SHA
    const currentResponse = await fetch(
      ${apiUrl}?ref=${branch},
      {
        method: "GET",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": Bearer ${token},
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();

      return new Response(
        JSON.stringify({
          success: false,
          error: "تعذر قراءة data.json",
          details: errorText
        }),
        {
          status: currentResponse.status,
          headers
        }
      );
    }

    const currentFile = await currentResponse.json();

    // تحويل البيانات إلى JSON
