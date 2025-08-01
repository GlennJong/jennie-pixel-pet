import 'react';
import { useState, useEffect } from 'react';

const ColorPicker: React.FC = ({ defaultColor, onChange }) => {
  const [color, setColor] = useState(defaultColor || "#ffffff");

  useEffect(() => {
    onChange && onChange(color);
  }, [color]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', }}>
      <div style={{ mixBlendMode: 'difference' }}>
        {color}
      </div>
      <label>
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
        />
      </label>
    </div>
  );
};

export default ColorPicker;