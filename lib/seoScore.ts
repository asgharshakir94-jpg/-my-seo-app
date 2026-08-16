export function computeArticleScore(html: string, keyword: string) {
    const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const headingCount = (html.match(/<h[23][^>]*>/gi) || []).length;
    const linkCount = (html.match(/<a\s+[^>]*href/gi) || []).length;
    const imageCount = (html.match(/<img\s+[^>]*src/gi) || []).length;
  
    const plainText = html.replace(/<[^>]+>/g, ' ').toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const keywordOccurrences = keywordLower ? plainText.split(keywordLower).length - 1 : 0;
    const keywordDensity = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0;
  
    const wordCountScore = wordCount >= 900 && wordCount <= 1400
      ? 100
      : Math.max(0, 100 - Math.abs(1150 - wordCount) / 10);
    const densityScore = keywordDensity >= 0.5 && keywordDensity <= 2.5
      ? 100
      : Math.max(0, 100 - Math.abs(1.5 - keywordDensity) * 20);
    const headingScore = Math.min(100, headingCount * 20);
    const linkScore = Math.min(100, linkCount * 25);
    const imageScore = Math.min(100, imageCount * 34);
  
    const total = Math.round(
      wordCountScore * 0.25 +
      densityScore * 0.25 +
      headingScore * 0.2 +
      linkScore * 0.15 +
      imageScore * 0.15
    );
  
    return {
      total,
      breakdown: {
        wordCount,
        headingCount,
        linkCount,
        imageCount,
        keywordDensity: Math.round(keywordDensity * 100) / 100,
        wordCountScore: Math.round(wordCountScore),
        densityScore: Math.round(densityScore),
        headingScore,
        linkScore,
        imageScore,
      },
    };
  }