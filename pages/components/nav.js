import Link from "next/link";
import React, { useState } from "react";
import styles from "../../styles/Nav.module.css";
import { Cross as Hamburger } from "hamburger-react";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  return (
    <div>
      <div className={styles.desktop}>
        <div className={styles.header}>
          <Link href="#default" className={styles.logo}>
            CompanyLogo
          </Link>

          <div className={styles.headerRight}>
            <Link className={styles.active} href="/">
              Home
            </Link>
            <Link href="#contact">Contact</Link>
            <Link href="#about">About</Link>
          </div>
        </div>
      </div>
      <div className={styles.mobile}>
        <div className={styles.header}>
          <Link href="#default" className={styles.logo}>
            CompanyLogo
          </Link>
          <div className={styles.hambarger}>
            <Hamburger toggled={isOpen} toggle={setOpen} />
          </div>
          <div className={styles.headerRight} style={isOpen ? {transform: "scaleY(1)"}:{transform: "scaleY(0)"}}>
            <div className={styles.links}>
              <Link className={styles.active} href="/">
                Home
              </Link>
              <Link href="#contact">Contact</Link>
              <Link href="#about">About</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nav;
