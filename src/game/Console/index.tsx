import { useState } from 'react';
import './style.css';
import { EventBus } from '../EventBus';

const Console = ({ children }: { children: React.ReactNode }) => {
  const [ isFilterOpen, setIsFilterOpen ] = useState(false);
  
  return (
    <div className="console">
      <div className="base">
        <div className="monitor">
          <div className="monitor-inner" style={{ width: '160px', height: '144px' }}>
            <div className={`filter-greenscreen ${isFilterOpen ? 'active' : ''}`}>
              <div className={`filter-grayscale ${isFilterOpen ? 'active' : ''}`}>
                { children }
              </div>
            </div>
          </div>
        </div>
        <div className="buttons">
          <div className="circle-btn-wrapper">
            <button className="circle-btn"  onClick={() => EventBus.emit('trigger-button', 'left')}><div style={{ transform: 'rotate(180deg)' }}>►</div></button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn"  onClick={() => EventBus.emit('trigger-button', 'right')}>►</button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn"  onClick={() => EventBus.emit('trigger-button', 'space')}></button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn special" onClick={() => setIsFilterOpen(!isFilterOpen)}></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Console;