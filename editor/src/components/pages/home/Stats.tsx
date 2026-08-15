import React from 'react';

interface Stats {
  statsVisible: boolean
}
const Stats: React.FC<Stats> = ({ statsVisible }) => {
  return (
    <section id="stats">
        <div className={`content ${statsVisible ? 'stats-visible' : ''}`}>
          <h2>Site Statistics</h2>
          <div className="stats-container">
            <div className="stat">
              <div className="number">50+</div>
              <div className="label">Years of Experience</div>
            </div>
            <div className="stat">
              <div className="number">300+</div>
              <div className="label">Companies</div>
            </div>
            <div className="stat">
              <div className="number">108+</div>
              <div className="label">Covered Countries</div>
            </div>
            <div className="stat">
              <div className="number">1,500+</div>
              <div className="label">Couriers</div>
            </div>
          </div>
        </div>
    </section>
  );
}

export default Stats;
