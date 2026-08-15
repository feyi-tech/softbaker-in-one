import React from 'react';

const Header = () => {
  return (
    <header className="site-navbar js-sticky-header site-navbar-target d-none" role="banner">
        <div className="container">
          <div className="row align-items-center position-relative">
            <div className="site-logo">
              <a href="index.html" className="text-black">
                <span className="text-primary">Cargo</span>
              </a>
            </div>

            <div className="col-12">
              <nav className="site-navigation text-right ml-auto" role="navigation">
                <ul className="site-menu main-menu js-clone-nav ml-auto d-none d-lg-block">
                  <li>
                    <a href="#home" className="nav-link">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="nav-link">
                      Services
                    </a>
                  </li>
                  <li className="has-children">
                    <a href="#about" className="nav-link">
                      About Us
                    </a>
                    <ul className="dropdown arrow-top">
                      <li>
                        <a href="#pricing" className="nav-link">
                          Pricing
                        </a>
                      </li>
                      <li>
                        <a href="#faq" className="nav-link">
                          FAQ
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#why" className="nav-link">
                      Why Us
                    </a>
                  </li>
                  <li>
                    <a href="#testimonials" className="nav-link">
                      Testimonials
                    </a>
                  </li>
                  <li>
                    <a href="#blog" className="nav-link">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="nav-link">
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="toggle-button d-inline-block d-lg-none">
              <a href="#" className="site-menu-toggle py-5 js-menu-toggle text-black">
                <span className="icon-menu h3"></span>
              </a>
            </div>
          </div>
        </div>
      </header>
  );
}

export default Header;