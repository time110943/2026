const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

export default async (request) => {
  // دعم طلب OPTIONS
  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 200,
      headers
    });
  }

  // السماح فقط بـ POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed"
      }),
      {
        status: 405,
        headers
      }
    );
  }

  try {
    // قراءة البيانات القادمة من لوحة التحكم
    const body = await request.json();
    const data = body.data ?? body;

    // التحقق من وجود البيانات
    if (!data || typeof data !== "object") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "البيانات غير صحيحة"
        }),
        {
          status: 400,
          headers
        }
      );
    }

    // قراءة GitHub Token من Netlify
    const token = Netlify.env.get("GITHUB_TOKEN");

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GITHUB_TOKEN غير موجود في Netlify"
        }),
        {
          status: 500,
          headers
        }
      );
    }

    // معلومات GitHub
    const owner = "time110943";
    const repo = "2026";
    const path = "dataab2026.js";
    const branch = "main";

    const apiUrl =
      https://api.github.com/repos/${owner}/${repo}/contents/${path};

    const githubHeaders = {
      "Accept": "application/vnd.github+json",
      "Authorization": Bearer ${token},
      "X-GitHub-Api-Version": "2022-11-28"
    };

    // جلب الملف الحالي للحصول على SHA
    const currentResponse = await fetch(
      ${apiUrl}?ref=${encodeURIComponent(branch)},
      {
        method: "GET",
        headers: githubHeaders
      }
    );

    if (!currentResponse.ok) {
      const errorText = await currentResponse.text();

      return new Response(
        JSON.stringify({
          success: false,
