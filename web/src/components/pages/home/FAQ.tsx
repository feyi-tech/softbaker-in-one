import React from 'react';

const FAQ = () => {
  return (
    <section id="faq">
        <div className="content">
          <h2>FAQ</h2>
          <ul>
            <li>
              <h3>How can I track my package?</h3>
              <p>You can use the tracking number provided to you and enter it in the tracking form on our website to check the current status of your package.</p>
            </li>
            <li>
              <h3>What are your delivery timeframes?</h3>
              <p>Delivery timeframes depend on the destination and the type of service you choose. We offer express delivery options for faster shipping.</p>
            </li>
            <li>
              <h3>Do you provide insurance for shipments?</h3>
              <p>Yes, we offer insurance options to protect your shipments against loss or damage. Please contact us for more details.</p>
            </li>
          </ul>
        </div>
    </section>
  );
}

export default FAQ;
