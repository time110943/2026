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
    // قراءة البيانات المرسلة
    const body = await req.json();

    if (!body  body.data === undefined  body.data === null) {
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

    // GitHub Token
    const token = process.env.GITHUB_TOKEN;

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

    // بيانات المستودع
    const owner = "time110943";
    const repo = "2026";
    const path = "dataab2026.js";
    const branch = "main";

    // رابط GitHub API
    const apiUrl =
      https://api.github.com/repos/${owner}/${repo}/contents/${path};

    // جلب الملف الحالي للحصول على SHA
    const currentResponse = await fetch(
      ${apiUrl}?ref=${encodeURIComponent(branch)},
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
          error: "تعذر قراءة الملف من GitHub",
          status: currentResponse.status,
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
    const jsonContent = JSON.stringify(body.data, null, 2);

    // تحويل المحتوى إلى Base64
    const encodedContent = Buffer
      .from(jsonContent, "utf8")
      .toString("base64");

    // تحديث الملف في GitHub
    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": Bearer ${token},
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: body.message || "Update data from control panel",
        content: encodedContent,
        sha: currentFile.sha,
        branch: branch
      })
    });

    const result = await updateResponse.json();

    if (!updateResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "فشل تحديث الملف في GitHub",
          status: updateResponse.status,
          details: result
        }),
        {
          status: updateResponse.status,
          headers
        }
      );
    }

    // نجاح
    return new Response(
      JSON.stringify({
        success: true,
        message: "تم تحديث dataab2026.js بنجاح",
        commit: result.commit?.sha || null
      }),
      {
        status: 200,
        headers
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "حدث خطأ غير معروف"
      }),
      {
        status: 500,
        headers
      }
    );
  }
};
