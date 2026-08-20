export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "POST فقط" }),
      { status: 405, headers }
    );
  }

  try {
    const body = await req.json();

    if (!body.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "لم يتم إرسال data"
        }),
        { status: 400, headers }
      );
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GITHUB_TOKEN غير موجود"
        }),
        { status: 500, headers }
      );
    }

    const owner = "time110943";
    const repo = "2026";
    const path = "data.json";
    const branch = "main";

    const apiUrl =
      https://api.github.com/repos/${owner}/${repo}/contents/${path};

    // الحصول على النسخة الحالية لمعرفة SHA
    const currentResponse = await fetch(
      ${apiUrl}?ref=${branch},
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
          error: "تعذر قراءة data.json",
          details: errorText
        }),
        { status: currentResponse.status, headers }
      );
    }

    const currentFile = await currentResponse.json();

    const jsonContent = JSON.stringify(body.data, null, 2);

    const encodedContent = Buffer
      .from(jsonContent, "utf8")
      .toString("base64");

    // تحديث data.json
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
          error: "فشل تحديث data.json",
          details: result
        }),
        { status: updateResponse.status, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم تحديث data.json بنجاح",
        commit: result.commit?.sha || null
      }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers }
    );
  }
};
