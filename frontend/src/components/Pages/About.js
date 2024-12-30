import React from "react";
import "./Pages.css";

const About = () => {
  return (
    <div className="page-container">
      <section className="page-header">
        <h1>About QuizMaster</h1>
      </section>

      <section className="page-content">
        <div className="content-section">
          <h2>Our Mission</h2>
          <p>
            At QuizMaster, we're dedicated to transforming education through
            interactive learning. Our platform empowers educators and students
            with tools that make learning engaging, effective, and enjoyable.
          </p>
        </div>

        <div className="content-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, QuizMaster was born from a simple idea: learning
            should be interactive and measurable. What started as a small
            project has grown into a comprehensive platform used by thousands of
            educators and students worldwide.
          </p>
        </div>

        <div className="content-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Innovation</h3>
              <p>
                Constantly improving our platform with cutting-edge educational
                technology
              </p>
            </div>
            <div className="value-card">
              <h3>Accessibility</h3>
              <p>Making quality education tools available to everyone</p>
            </div>
            <div className="value-card">
              <h3>Excellence</h3>
              <p>Maintaining high standards in everything we do</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>
                Building strong relationships between educators and learners
              </p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Our Team</h2>
          <p>
            Our diverse team of educators, developers, and designers works
            tirelessly to create the best possible learning experience for our
            users. We're passionate about education and technology, and we bring
            that passion to QuizMaster every day.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
