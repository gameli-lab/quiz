import React, { useState } from "react";
import "./Pages.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Message sent successfully! We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page-container">
      <section className="page-header">
        <h1>Contact Us</h1>
      </section>

      <section className="page-content">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <h3>📍 Address</h3>
              <p>
                Adeiso Methodist JHS
                <br />
                Amarkrom, Adeiso
              </p>
            </div>
            <div className="info-card">
              <h3>📞 Phone</h3>
              <p>
                +233 (054) 181-3988
                <br />
                Mon - Fri, 9:00 - 18:00
              </p>
            </div>
            <div className="info-card">
              <h3>✉️ Email</h3>
              <p>
                btorfu@proton.me
                <br />
                support@quizmaster.com
                <br />
                info@quizmaster.com
              </p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Send us a Message</h2>
            {status && <div className="success-message">{status}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-control"
                  rows="5"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
