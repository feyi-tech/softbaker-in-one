import React from 'react';

interface Home {
    trackingNumber: string,
    handleTrackingNumberChange: (e: any) => void,
    handleTrackingStatusCheck: (e: any) => void
}
const Home: React.FC<Home> = ({ trackingNumber, handleTrackingNumberChange, handleTrackingStatusCheck }) => {
  return (
    <section id="home">
        <div className="hero">
          <h1>CHOOSE YOUR QUALITY DELIVERY OF YOUR CARGO</h1>
          <div className="tracking-input">
            <input
              type="text"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={handleTrackingNumberChange}
            />
            <button onClick={handleTrackingStatusCheck}>Check Status</button>
          </div>
        </div>
      </section>
  );
}

export default Home;
