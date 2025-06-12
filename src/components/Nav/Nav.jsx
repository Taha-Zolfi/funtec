import React, { useEffect, useState } from 'react';
import './Nav.css';

const Nav = () => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false);
  };

  return (
    <div className={`Nav ${showNav ? 'Nav--visible' : 'Nav--hidden'}`}>
      <div className={`right ${menuOpen ? 'open' : ''}`}>
        <a href="#" onClick={handleLinkClick}>خانه</a>
        <hr className="separator" />
        <a href="#" onClick={handleLinkClick}>محصولات</a>
        <hr className="separator" />
        <a href="#" onClick={handleLinkClick}>درباره ما</a>
        <hr className="separator" />
        <a href="#" onClick={handleLinkClick}>تماس با ما</a>
      </div>

      <div className={`menu-icon ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default Nav;
