import React, { useEffect } from "react";

import jQuery from "jquery";


import {socialLinks} from "./socialLinks"

import cn from "classnames"
import "./Footer.scss"

function Footer() {

    useEffect(() => {
        window.addEventListener("scroll", init);
    })
    function init(e: any){
        if (window.scrollY   > 100) {
            jQuery('.toTopButton').fadeIn();
        } else {
            jQuery('.toTopButton').fadeOut();
        }
    }
    return (
        <>
            <div className={cn("back-black1 page-footer flex")}>
                <div className="flex py-1 m-auto-h">
                    <div className="flex-col col-md-12">
                        <div className="flex my-4 sp-item-center">
                            {
                                socialLinks.map((item, index) => 
                                    <a 
                                        key={index} 
                                        className={item.label + " m-2 m-auto-v"} 
                                        href={item.link}>
                                        <img src={item.icon} className="w-24px" alt="" />
                                    </a>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <div className="content-row">
                        <img src="/assets/img/cifi.png" alt="" />
                        <div>© 2021 Citizen Finance, All Rights Reserved.</div>
                    </div>
                </div>
            </div>
            {/* <div className="toTopButton pointer" onClick={() => goToTop()}>
                <svg className="flickity-button-icon" viewBox="0 0 100 100"><path d="M 10,50 L 60,100 L 70,90 L 30,50  L 70,10 L 60,0 Z" className="arrow" transform="translate(100, 100) rotate(180) "></path></svg>
            </div> */}
        </>
    )
}

export default Footer;
