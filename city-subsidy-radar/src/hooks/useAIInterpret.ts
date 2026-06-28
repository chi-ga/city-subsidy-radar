import { useState, useCallback } from 'react';
import { buildPrompt } from '../utils';
import type { UserProfile, MatchResultItem, APIConfig } from '../types';

interface AIResponse {
  interpretation: string;
  pitfallTips: string[];
  reverseSuggestions: { subsidyName: string; suggestion: string }[];
}

/**
 * 从 AI 返回的文本中鲁棒地提取 JSON 对象
 * 1. 优先尝试直接解析整个文本
 * 2. 清洗 Markdown 代码块标记后解析
 * 3. 使用正则提取最外层 JSON 对象作为兜底
 */
function extractJSONFromText(text: string): AIResponse | null {
  const cleaned = text.trim();

  // 尝试 1：直接解析
  try {
    return JSON.parse(cleaned) as AIResponse;
  } catch {
    // 继续下一步
  }

  // 尝试 2：清洗 Markdown code block
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]) as AIResponse;
    } catch {
      // 继续下一步
    }
  }

  // 尝试 3：正则提取最外层 JSON 对象（考虑嵌套大括号）
  // 使用栈算法精确匹配最外层 {}
  let depth = 0;
  let start = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (cleaned[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1)) as AIResponse;
        } catch {
          // 继续搜索下一个可能的 JSON
          start = -1;
        }
      }
    }
  }

  // 所有尝试均失败
  return null;
}

export function useAIInterpret() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interpret = useCallback(
    async (
      user: UserProfile,
      matchedResults: MatchResultItem[],
      nearMissResults: MatchResultItem[],
      apiConfig: APIConfig
    ): Promise<AIResponse | null> => {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const prompt = buildPrompt(user, matchedResults, nearMissResults);

        const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiConfig.key}`,
          },
          body: JSON.stringify({
            model: apiConfig.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI 调用失败 (${response.status})`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
          throw new Error('AI 返回内容为空');
        }

        const parsed = extractJSONFromText(content);
        if (parsed) {
          return parsed;
        }

        // 若无法解析为预期 JSON 结构，返回原始文本作为 interpretation 的降级响应
        return {
          interpretation: content,
          pitfallTips: [],
          reverseSuggestions: [],
        };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('AI 请求超时，请稍后重试');
        } else {
          setError(err instanceof Error ? err.message : '未知错误');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { interpret, isLoading, error };
}
