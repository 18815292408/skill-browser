import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../store/skillStore';

interface CacheData {
  [skillId: string]: {
    nameZh: string;
    descriptionZh: string;
    lastUpdated: string;
    isFavorite?: boolean;
    isPinned?: boolean;
  };
}

const CACHE_FILE = 'translation-cache.json';

// 清除所有翻译缓存
export async function clearCache(): Promise<void> {
  try {
    await invoke('save_cache', { fileName: CACHE_FILE, content: '{}' });
  } catch (e) {
    console.error('清除缓存失败:', e);
  }
}

export async function loadCache(): Promise<CacheData> {
  try {
    const data = await invoke<string>('load_cache', { fileName: CACHE_FILE });
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveCache(cache: CacheData): Promise<void> {
  try {
    await invoke('save_cache', { fileName: CACHE_FILE, content: JSON.stringify(cache) });
  } catch (e) {
    console.error('保存缓存失败:', e);
  }
}

export async function translateAndCache(
  skill: Skill,
  cache: CacheData,
  apiKey: string
): Promise<Skill> {
  if (cache[skill.id]) {
    return { ...skill, ...cache[skill.id] };
  }

  if (!apiKey) {
    return skill;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个翻译助手。请严格按照以下格式翻译：

名称：中文名称（简洁，不超过15字）
1简介：用通俗易懂的大白话介绍这个技能是干什么的，让完全不懂技术的人也能看懂。不超过50字。
2时机：说明在什么情况下使用这个技能，用一句话描述。不超过30字。
3调用：直接给出调用方式，如"输入 /xxx"。

每部分用换行分隔，不要使用任何格式符号，只用纯文本。`
          },
          {
            role: 'user',
            content: `翻译以下 Skill：\n名称: ${skill.name}\n描述: ${skill.description.slice(0, 800)}`
          }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || '';

    // 解析翻译结果
    let nameZh = skill.name;
    let descriptionZh = '';

    const lines = translation.split('\n');
    let intro = '';
    let timing = '';
    let call = '';

    for (const line of lines) {
      if (line.includes('名称')) {
        nameZh = line.replace(/^.*名称[：:]\s*/, '').trim() || skill.name;
      } else if (line.includes('1') && line.includes('简介')) {
        intro = line.replace(/^.*简介[：:]\s*/, '').trim();
      } else if (line.includes('2') && line.includes('时机')) {
        timing = line.replace(/^.*时机[：:]\s*/, '').trim();
      } else if (line.includes('3') && line.includes('调用')) {
        call = line.replace(/^.*调用[：:]\s*/, '').trim();
      }
    }

    if (intro || timing || call) {
      descriptionZh = [
        intro ? '简介：' + intro : '',
        timing ? '时机：' + timing : '',
        call ? '调用：' + call : ''
      ].filter(Boolean).join('\n');
    } else {
      // 兼容旧格式
      descriptionZh = lines.slice(2).join(' ').trim() || skill.description;
    }

    const cacheEntry = {
      nameZh,
      descriptionZh,
      lastUpdated: new Date().toISOString()
    };

    cache[skill.id] = cacheEntry;
    await saveCache(cache);

    return { ...skill, ...cacheEntry };
  } catch (e) {
    console.error('翻译失败:', e);
    return skill;
  }
}
