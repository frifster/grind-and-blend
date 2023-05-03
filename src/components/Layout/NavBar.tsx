"use client";
import { useState } from 'react';
import { useScroll, motion, useTransform } from "framer-motion";

import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';

import Logo from '@assets/svgs/logo.svg';
import Burger from '@assets/svgs/burger.svg';

import ROUTES from '@constants/routes';
import MQ from '@constants/media_queries';
import { NAV_FONT_SIZE, underlineStyles, underlineStylesActive } from '@constants/styles';

type Props = {}

const NAV_ROUTES = [
    { ...ROUTES.MENU },
    { ...ROUTES.ORDER_ONLINE },
    { ...ROUTES.REWARDS },
    { ...ROUTES.LOCATIONS },
    { ...ROUTES.REACH_US }
]


const NavBar = (props: Props) => {
    const { scrollYProgress } = useScroll()
    const backgroundColor = useTransform(scrollYProgress, [0, 0.1, 1], ['rgba(245, 222, 179,0)', 'rgba(245, 222, 179,0.8)', 'rgba(245, 222, 179,1)'])
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleOverlayClick = () => {
        setIsMenuOpen(false);
    }

    const handleBurgerClick = () => {
        setIsMenuOpen(true);
    }

    return (
        <StyledNavBar style={{ backgroundColor }}>
            <DesktopNavMenu>
                {
                    NAV_ROUTES.map((route, index) => (
                        <DesktopNavItem key={route.NAME + index} >
                            <Link href={route.PATH}>
                                {route.NAME}
                            </Link>
                        </DesktopNavItem>
                    ))
                }
            </DesktopNavMenu>
            <BurgerMenu>
                <Image src={Burger} alt="Burger Menu" onClick={handleBurgerClick} />
                <Overlay className={isMenuOpen ? 'isMenuOpen' : ''} onClick={handleOverlayClick} />
                <MobileNavMenu className={isMenuOpen ? 'isMenuOpen' : ''}>
                    {
                        NAV_ROUTES.map((route, index) => (
                            <MobileNavItem key={route.NAME + index}>
                                <Link href={route.PATH}>
                                    {route.NAME}
                                </Link>
                            </MobileNavItem>
                        ))
                    }
                </MobileNavMenu>
            </BurgerMenu>

            <Link href={ROUTES.HOME.PATH} className='home-logo'>
                <Image priority src={Logo} alt="Grind and Blend Logo" />
                <h1>Grind & Blend</h1>
            </Link>
        </StyledNavBar>
    )
}


const StyledNavBar = styled(motion.nav)({
    position: 'fixed',
    display: 'grid',
    backgroundColor: 'var(--secondary-color)',
    width: '100%',
    height: "clamp(60px, 6dvh, 91px)",
    padding: "0 6dvw",
    gridTemplateColumns: '1fr 1fr',
    justifyContent: 'space-between',
    zIndex: 999,
    transition: 'transform 500ms ease-in-out',

    "a.home-logo": {
        display: 'flex',
        position: 'relative',
        justifySelf: 'end',
        img: {
            height: 'clamp(20px, 2dvh, 60px)',
            alignSelf: 'center',
        },
        h1: {
            fontSize: '32px',
            letterSpacing: '1px',
            color: 'var(--accent-color)',
            marginLeft: '10px',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            alignSelf: 'center',
        }
    },

    [MQ[1]]: {
        "a.home-logo": {
            h1: {
                fontSize: '28px',
            }
        },
    },

    [MQ[2]]: {
        "a.home-logo": {
            h1: {
                fontSize: '24px',
            }
        },
    },

    [MQ[4]]: {
        "a.home-logo": {
            h1: {
                fontSize: '20px',
            }
        },
    },

    [MQ[7]]: {
        "a.home-logo": {
            h1: {
                fontSize: '16px',
            }
        },
    },

})

const DesktopNavMenu = styled(motion.div)({
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    gap: '2dvw',

    [MQ[6]]: {
        display: 'none',
    },
})

const DesktopNavItem = styled(motion.div)({
    fontSize: NAV_FONT_SIZE,
    fontWeight: 800,
    letterSpacing: '1px',
    color: 'var(--accent-color)',
    position: 'relative',
    whiteSpace: 'nowrap',
    "--color": 'var(--accent-color)',

    '&:after': underlineStyles,

    '&:hover': {
        '&:after': underlineStylesActive
    },
})


const BurgerMenu = styled.div({
    display: 'none',
    alignSelf: 'center',
    justifySelf: 'start',
    cursor: 'pointer',

    [MQ[6]]: {
        display: 'block',
    },


})

const MobileNavMenu = styled.div({
    position: 'fixed',
    top: '0',
    right: '0',
    height: '100dvh',
    flexDirection: 'column',
    backgroundColor: 'var(--secondary-color)',
    boxShadow: '-4px 0px 4px rgba(var(--accent-color-rgb), 0.45)',
    overflow: 'hidden',
    touchAction: 'none',
    zIndex: 9999,
    padding: "30px 20px",
    transform: 'translateX(105%)',
    transition: 'transform 0.3s ease-in-out',

    "&.isMenuOpen": {
        transform: 'translateX(0%)',
    }
})

const Overlay = styled.div({
    display: 'block',
    content: '""',
    position: 'fixed',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 0,
    transform: 'translateX(105%)',
    transition: 'opacity 0.3s ease-in-out 0.3s',
    opacity: 0,

    "&.isMenuOpen": {
        opacity: 1,
        transform: 'translateX(0%)',
    }
})

const MobileNavItem = styled.div({
    fontSize: NAV_FONT_SIZE,
    fontWeight: 800,
    letterSpacing: '1px',
    color: 'var(--accent-color)',
    position: 'relative',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    marginBottom: '20px',

    '&:hover, &:focus, &:active': {
        a: {
            position: 'relative',
        },
        '& a:after': {
            content: '""',
            position: 'absolute',
            display: 'block',
            width: '60%',
            height: '4px',
            margin: '0 auto',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '99px',
        }
    },

})


export default NavBar