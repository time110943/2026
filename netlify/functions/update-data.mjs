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

  // POST فقط
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
    if (
      !body ||
      body.data === undefined ||
      body.data === null
    ) {
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

    const owner = "time110943";
    const repo = "2026";
    const path = "dataab2026.js";
    const branch = "main";

    const apiUrl =
      https://api.github.com/repos/${owner}/${repo}/contents/${path};

    // جلب الملف الحالي للحصول على SHA
    const currentResponse = await fetch(
      ${apiUrl}?ref=${encodeURIComponent(branch)},
      {
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
          error: "تعذر قراءة dataab2026.js من GitHub",
          details: errorText
        }),
        {
          status: currentResponse.status,
          headers
        }
      );
    }

    const currentFile = await currentResponse.json();

    // إنشاء محتوى JavaScript الصحيح
    const jsContent =
      "window.dataAb2026 = " +
      JSON.stringify(body.data, null, 2) +
      ";\n";

    // تحويل المحتوى إلى Base64
    const encodedContent = Buffer
      .from(jsContent, "utf8")
      .toString("base64");

    // تحديث dataab2026.js في GitHub
    const updateResponse = await fetch(apiUrl, {
      method: "PUT",

      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": Bearer ${token},
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message:
          body.message ||
          "Update lectures from control panel",

        content: encodedContent,

        sha: currentFile.sha,

        branch: branch
      })
    });

    const result = await updateResponse.json();

    // فشل GitHub
    if (!updateResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "فشل تحديث dataab2026.js",
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
        message: "تم تحديث بيانات المحاضرات بنجاح",
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
        error: error?.message || "خطأ غير معروف"
      }),
      {
        status: 500,
        headers
      }
    );

  }
};
