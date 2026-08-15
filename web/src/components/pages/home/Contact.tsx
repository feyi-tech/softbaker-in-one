import React from 'react';

const Contact = () => {
  return (
    <section id="contact">
        <div className="content">
          <h2>Contact</h2>
          <p>Get in touch with us for any inquiries or to discuss your shipping requirements:</p>
          <p>Phone: 123-456-7890</p>
          <p>Email: info@example.com</p>

          <form>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea id="message" name="message" rows={4} required></textarea>
            </div>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>
  );
}

export default Contact;
