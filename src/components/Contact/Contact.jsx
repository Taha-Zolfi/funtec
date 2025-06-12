import React from "react";
import "./Contact.css";
import logo from "./logo.png";
import { FaMapMarkerAlt, FaTelegram, FaInstagram } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="contact-container">
      <h1 className="contact-title">با ما در ارتباط باشید!</h1>

      <div className="contact-content">
        <address className="contact-left">
          <p>
            <FaMapMarkerAlt className="icon" />
            <span>ایران، تهران</span>
          </p>
          <p>
            <FaTelegram className="icon" />
            <span>@funtec_co</span>
          </p>
          <p>
            <FaInstagram className="icon" />
            <span>@Funtec.co</span>
          </p>
        </address>

        <div className="vertical-divider"></div>

        <div className="contact-right">
          <p dir="ltr">0919-177-17-27</p>
          <p dir="ltr">0910-910-1380</p>
          <p dir="ltr">021-7723-0537</p>
        </div>
      </div>

      <footer className="contact-footer">
        <span>با تکنولوژی آینده رو بسازید</span>
        <img src={logo} alt="Funtec Logo" className="contact-logo" />
      </footer>

      <p className="copyright">© 2025 Funtec. تمامی حقوق محفوظ است.</p>
    </section>
  );
};

export default Contact;
