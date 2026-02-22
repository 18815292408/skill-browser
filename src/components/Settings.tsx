import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export function Settings({ isOpen, onClose, apiKey, onSave }: Props) {
  const [key, setKey] = useState(apiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-4 w-80">
        <h2 className="text-lg font-bold mb-4">设置</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">DeepSeek API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-500 mt-1">请输入 DeepSeek API Key</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(key)}
            className="flex-1 bg-blue-600 py-2 rounded text-sm hover:bg-blue-500"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 py-2 rounded text-sm hover:bg-gray-600"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
