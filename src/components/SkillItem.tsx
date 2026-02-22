import { Skill } from '../store/skillStore';

interface Props {
  skill: Skill;
  onCopy: (cmd: string) => void;
  selectMode?: boolean;
  selected?: boolean;
  isTranslated?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onTogglePinned?: (id: string) => void;
}

export function SkillItem({ skill, onCopy, selectMode, selected, isTranslated, onToggleSelect, onToggleFavorite, onTogglePinned }: Props) {
  const displayName = skill.nameZh || skill.name;
  const displayDesc = skill.descriptionZh || skill.description;
  const isFavorite = skill.isFavorite || false;
  const isPinned = skill.isPinned || false;

  // 检查是否有新格式（简介/时机/调用）
  const hasNewFormat = displayDesc.includes('简介：') || displayDesc.includes('时机：');

  // 解析各部分
  const getSection = (key: string) => {
    const match = displayDesc.match(new RegExp(`${key}：(.+?)(?=\\n|$)`));
    return match?.[1]?.trim();
  };

  const intro = getSection('简介');
  const timing = getSection('时机');

  const handleClick = () => {
    if (selectMode && onToggleSelect) {
      if (isTranslated) {
        onToggleSelect(skill.id);
      }
    } else {
      onCopy(`/${skill.name}`);
    }
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-3 transition-colors cursor-pointer ${
        selectMode ? (selected ? 'ring-2 ring-blue-500' : 'opacity-60') : 'hover:bg-gray-750'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectMode && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                if (onToggleSelect) {
                  onToggleSelect(skill.id);
                }
              }}
              className="w-4 h-4"
            />
          )}
          {isPinned && <span className="text-yellow-400">📌</span>}
          <span className="font-medium text-white">📦 {displayName}</span>
          {isTranslated && <span className="text-xs text-green-400">✓ 已翻译</span>}
        </div>
        {!selectMode && (
          <div className="flex items-center gap-1">
            <button
              className={`text-xs px-2 py-1 rounded ${isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) {
                  onToggleFavorite(skill.id);
                }
              }}
              title={isFavorite ? '取消常用' : '设为常用'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
            <button
              className={`text-xs px-2 py-1 rounded ${isPinned ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onTogglePinned) {
                  onTogglePinned(skill.id);
                }
              }}
              title={isPinned ? '取消置顶' : '置顶'}
            >
              {isPinned ? '📌' : '📍'}
            </button>
            <button
              className="text-xs bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(`/${skill.name}`);
              }}
            >
              复制
            </button>
          </div>
        )}
      </div>

      {hasNewFormat ? (
        <div className="text-gray-300 text-sm mt-2 space-y-1">
          {intro && (
            <div>
              <span className="text-blue-400 font-medium">简介：</span>
              {intro}
            </div>
          )}
          {timing && (
            <div>
              <span className="text-purple-400 font-medium">时机：</span>
              {timing}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-300 text-sm mt-1">{displayDesc}</div>
      )}

      <div className="text-gray-500 text-xs mt-1">调用: /{skill.name}</div>
    </div>
  );
}
