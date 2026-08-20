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
      JSON.stringify({
        success: false,
        error: "POST فقط"
      }),
      { status: 405, headers }
    );
  }

  try {
    const body = await req.json();

    if (!body || body.data === undefined) {
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
    const path = "dataab2026.js";
    const branch = "main";

    const apiUrl =
      "https://api.github.com/repos/" +
      owner +
      "/" +
      repo +
      "/contents/" +
      path;

    const getResponse = await fetch(
      apiUrl + "?ref=" + encodeURIComponent(branch),
      {
        method: "GET",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer " + token,
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!getResponse.ok) {
      const details = await getResponse.text();

      return new Response(
        JSON.stringify({
          success: false,
          error: "تعذر قراءة الملف من GitHub",
          details: details
        }),
        { status: getResponse.status, headers }
      );
    }

    const currentFile = await getResponse.json();

    const content = JSON.stringify(body.data, null, 2);

    const encodedContent = Buffer
      .from(content, "utf8")
      .toString("base64");

    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + token,
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
          details: result
        }),
        { status: updateResponse.status, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم الحفظ بنجاح",
        commit: result.commit ? result.commit.sha : null
      }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error && error.message
          ? error.message
          : "خطأ غير معروف"
      }),
      { status: 500, headers }
    );
  }
};
