import 'react';
import { useState, useEffect } from 'react';

const ColorPicker: React.FC = ({ defaultColor, onChange }) => {
  const [color, setColor] = useState(defaultColor || "#ffffff");

  useEffect(() => {
    onChange && onChange(color);
  }, [color]);

  return (
    <div style={{ position: 'fixed', top: '12px', left: '12px', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <label>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </label>
      <div style={{ mixBlendMode: 'difference' }}>
        {color}
      </div>
    </div>
  );
};

export default ColorPicker;