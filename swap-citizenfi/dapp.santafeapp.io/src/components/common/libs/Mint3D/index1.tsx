import React from "react";

import "./mint-3d.scss"

function Mint3D(props: any) {

    let arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]
    let arr_3 = [1,2,3]
    return (
        <>
            <div className='tri m-auto-h'>
                {
                    arr_3.map((item_ : any, index_: any) =>
                        <div key={index_} className='side'>
                            {
                                arr.map((item: any, index: any) => 
                                    <div className='ring' key={index}></div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </>
    );
}

export default Mint3D

