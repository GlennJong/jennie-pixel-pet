import React from "react";

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface Props {
  value: JSONValue;
  onChange: (value: JSONValue) => void;
  keyName?: string;
  wording?: Record<string, string>;
  template?: Record<string, any>;
  hide?: string[];
  lock?: string[];
  title?: string;
}

const JsonEditor: React.FC<Props> = ({ value, onChange, keyName, template = {}, wording = {}, hide = [], lock = [], title }) => {
  const [collapsed, setCollapsed] = React.useState(true);

  // 只在最外層渲染 title
  if (title) {
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 14,
            position: 'sticky',
            top: '0',
            background: 'rgba(30,30,30,0.5)',
            zIndex: 10,
            padding: '6px 4px',
            borderBottom: '1px solid #444',
          }}
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? '▶ ' : '▼ '}{title}
        </div>
        {!collapsed && (
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
            <JsonEditor
              value={value}
              template={template}
              onChange={onChange}
              wording={wording}
              hide={hide}
              lock={lock}
            />
          </div>
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
      <div>
        <label style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
          { isNaN(Number(labelText)) ?
            <span>{labelText}: </span>
            :
            <span>{Number(labelText)+1} </span>
          }
          <input
            type="text"
            value={value === null ? "" : value}
            onChange={e => onChange(e.target.value)}
            style={{ fontSize: '12px' }}
            disabled={isLocked}
          />
        </label>
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (keyName && hide.includes(keyName)) return null;
    const labelText = keyName ? (wording[keyName] ?? keyName) : undefined;
    const isLocked = keyName ? lock.includes(keyName) : false;
    // 依照 template[keyName][0] 產生預設物件
    const getDefaultItem = () => {
      console.log({keyName, template}, template[keyName])
      if (keyName && template && template[keyName]) {
        // 深拷貝，避免 reference 問題
        return JSON.parse(JSON.stringify(template[keyName]));
      }
      return "";
    };
    const handleAdd = () => {
      onChange([...value, getDefaultItem()]);
    };
    const handleRemove = (idx: number) => {
      const newArr = value.slice();
      newArr.splice(idx, 1);
      onChange(newArr);
    };
    return (
      <fieldset style={{ border: '1px solid hsla(0, 0%, 100%, 0.2)', marginBottom: 8 }}>
        {labelText && <legend style={{ fontSize: '12px' }}>{labelText}</legend>}
        {value.map((v, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8}}>
            <JsonEditor
              value={v}
              onChange={nv => {
                const newArr = [...value];
                newArr[i] = nv;
                onChange(newArr);
              }}
              keyName={String(i)}
              template={template}
              wording={wording}
              hide={hide}
              lock={lock}
            />
            <button type="button" onClick={() => handleRemove(i)} disabled={isLocked}>-</button>
          </div>
        ))}
        <button style={{ width: '100%' }} type="button" className="button" onClick={handleAdd} disabled={isLocked}>新增{labelText}</button>
      </fieldset>
    );
  }
  if (typeof value === "object" && value !== null) {
    if (keyName && hide.includes(keyName)) return null;
    const labelText = keyName ? (wording[keyName] ?? keyName) : undefined;
    return (
      // <fieldset style={{ border: '0px', borderLeft: '1px solid hsla(0, 0%, 100%, 0.2)', marginBottom: 8 }}>
      <fieldset style={{ border: '1px solid hsla(0, 0%, 100%, 0.2)', marginBottom: 4 }}>
        {
          labelText &&
          <legend style={{ fontSize: '12px' }}>
            { isNaN(Number(labelText)) ?
              <span>{labelText}: </span>
              :
              <span>{Number(labelText)+1} </span>
            }
          </legend>
        }
        {Object.entries(value).map(([k, v]) => (
          <JsonEditor
            key={k}
            value={v}
            onChange={nv => {
              onChange({ ...value, [k]: nv });
            }}
            keyName={k}
            wording={wording}
            template={template}
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