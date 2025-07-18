import React from "react";

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface Props {
  value: JSONValue;
  onChange: (value: JSONValue) => void;
  keyName?: string;
  wording?: Record<string, string>;
  hide?: string[];
  lock?: string[];
  title?: string;
}

const JsonEditor: React.FC<Props> = ({ value, onChange, keyName, wording = {}, hide = [], lock = [], title }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  // 只在最外層渲染 title
  if (title) {
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 18,
            marginBottom: 8,
            position: 'sticky',
            top: '-24px',
            background: 'rgba(30,30,30,0.5)',
            zIndex: 10,
            padding: '8px 0',
            borderBottom: '1px solid #444',
          }}
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? '▶ ' : '▼ '}{title}
        </div>
        {!collapsed && (
          <JsonEditor
            value={value}
            onChange={onChange}
            wording={wording}
            hide={hide}
            lock={lock}
          />
        )}
      </div>
    );
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    // 隱藏欄位
    if (keyName && hide.includes(keyName)) return null;
    const labelText = keyName ? (wording[keyName] ?? keyName) : undefined;
    const isLocked = keyName ? lock.includes(keyName) : false;
    return (
      <label>
        {labelText && <span>{labelText}: </span>}
        <input
          type="text"
          value={value === null ? "" : value}
          onChange={e => onChange(e.target.value)}
          disabled={isLocked}
        />
      </label>
    );
  }
  if (Array.isArray(value)) {
    if (keyName && hide.includes(keyName)) return null;
    const labelText = keyName ? (wording[keyName] ?? keyName) : undefined;
    const isLocked = keyName ? lock.includes(keyName) : false;
    const handleAdd = () => {
      onChange([...value, ""]);
    };
    const handleRemove = (idx: number) => {
      const newArr = value.slice();
      newArr.splice(idx, 1);
      onChange(newArr);
    };
    return (
      <fieldset style={{ border: '1px solid hsla(0, 0%, 100%, 0.2)', marginBottom: 8 }}>
        {labelText && <legend>{labelText}</legend>}
        {value.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <JsonEditor
              value={v}
              onChange={nv => {
                const newArr = [...value];
                newArr[i] = nv;
                onChange(newArr);
              }}
              keyName={String(i)}
              wording={wording}
              hide={hide}
              lock={lock}
            />
            <button type="button" onClick={() => handleRemove(i)} disabled={isLocked}>-</button>
          </div>
        ))}
        <button type="button" onClick={handleAdd} disabled={isLocked}>新增</button>
      </fieldset>
    );
  }
  if (typeof value === "object" && value !== null) {
    if (keyName && hide.includes(keyName)) return null;
    const labelText = keyName ? (wording[keyName] ?? keyName) : undefined;
    return (
      <fieldset style={{ border: '1px solid hsla(0, 0%, 100%, 0.2)', marginBottom: 8 }}>
        {labelText && <legend>{labelText}</legend>}
        {Object.entries(value).map(([k, v]) => (
          <JsonEditor
            key={k}
            value={v}
            onChange={nv => {
              onChange({ ...value, [k]: nv });
            }}
            keyName={k}
            wording={wording}
            hide={hide}
            lock={lock}
          />
        ))}
        {/* 可加上新增/刪除 key 的功能 */}
      </fieldset>
    );
  }
  return null;
};

export default JsonEditor;