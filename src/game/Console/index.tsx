import { useState } from 'react';
import './style.css';

const Console = ({ children }: { children: React.ReactNode }) => {
  const [ isFilterOpen, setIsFilterOpen ] = useState(false);
  
  return (
    <div className="console">
      <div className="base">
        <div className="monitor">
          <div className="monitor-inner" style={{ width: '320px', height: '288px' }}>
            <div className={`filter-greenscreen ${isFilterOpen ? 'active' : ''}`}>
              <div className={`filter-grayscale ${isFilterOpen ? 'active' : ''}`}>
                { children }
              </div>
            </div>
          </div>
        </div>
        <div className="buttons">
          <div className="circle-btn-wrapper">
            <button className="circle-btn" disabled onClick={() => setIsFilterOpen(!isFilterOpen)}>save</button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn" disabled onClick={() => setIsFilterOpen(!isFilterOpen)}>load</button>
          </div>
          <div className="circle-btn-wrapper">
            <button className="circle-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>retro</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Console;