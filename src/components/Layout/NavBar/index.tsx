"use client";
import Burger from "@assets/svgs/burger.svg";

import Logo from "@assets/svgs/logo.svg";
import AuthButton from "@/components/auth/AuthButton";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import ROUTES from "@constants/routes";
import classnames from "classnames/bind";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./navbar.module.scss";

const NAV_ROUTES = [
  { ...ROUTES.MENU },
  { ...ROUTES.ORDER_ONLINE },
  { ...ROUTES.REWARDS },
  { ...ROUTES.LOCATIONS },
  { ...ROUTES.REACH_US }
];


const cx = classnames.bind(styles);

const NavBar = () => {
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, [0, 0.1, 1], ["rgba(245, 222, 179,0)", "rgba(245, 222, 179,0.8)", "rgba(245, 222, 179,1)"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { hasPermission } = usePermissions();

  // Check if user has admin permissions
  const canAccessAdmin = hasPermission(PERMISSIONS.ROLES_CREATE) || hasPermission(PERMISSIONS.USERS_UPDATE);

  const handleOverlayClick = () => {
    setIsMenuOpen(false);
  };

  const handleBurgerClick = () => {
    setIsMenuOpen(true);
  };

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isMenuOpen]);

  const overlayClass = cx(styles.overlay, { isMenuOpen });
  const mobileNavMenuClass = cx(styles.mobile_nav_menu, { isMenuOpen });

  return (
    <motion.nav style={{ backgroundColor }} className={styles.navbar}>
      <div className={styles.desktop_nav_menu}>
        <div className={styles.desktop_nav_menu_item}>
          <AuthButton />
        </div>
        {
          NAV_ROUTES.map((route, index) => (
            <div className={styles.desktop_nav_menu_item} key={route.NAME + index}>
              <Link href={route.PATH}>
                {route.NAME}
              </Link>
            </div>
          ))
        }
        {canAccessAdmin && (
          <div className={styles.desktop_nav_menu_item}>
            <Link href="/admin">
              Admin
            </Link>
          </div>
        )}
      </div>
      <div className={styles.burger_menu}>
        <Image src={Burger} alt="Burger Menu" onClick={handleBurgerClick} />
        <div className={overlayClass} onClick={handleOverlayClick} />
        <div className={mobileNavMenuClass}>
          {
            NAV_ROUTES.map((route, index) => (
              <div className={styles.mobile_nav_menu_item} key={route.NAME + index}>
                <Link href={route.PATH}>
                  {route.NAME}
                </Link>
              </div>
            ))
          }
          {canAccessAdmin && (
            <div className={styles.mobile_nav_menu_item}>
              <Link href="/admin">
                Admin
              </Link>
            </div>
          )}
          <div className={styles.mobile_nav_menu_item}>
            <AuthButton />
          </div>
        </div>
      </div>

      <Link href={ROUTES.HOME.PATH} className={styles.home_logo}>
        <Image priority src={Logo} alt="Grind and Blend Logo" />
        <h1>Grind & Blend</h1>
      </Link>
    </motion.nav>
  );
};

export default NavBar;