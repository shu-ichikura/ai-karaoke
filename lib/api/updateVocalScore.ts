export const updateVocalScore = async (
  songId: string,
  vocalScore: number
): Promise<boolean> => {
  try {
    const res = await fetch("https://61mcvb9p1l.execute-api.ap-northeast-1.amazonaws.com/updateVocalScore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ songId, vocalScore }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("vocalScore更新失敗:", text);
      return false;
    }

    const json = await res.json();
    console.log("vocalScore更新成功:", json);
    return true;
  } catch (error) {
    console.error("vocalScore更新エラー:", error);
    return false;
  }
};
