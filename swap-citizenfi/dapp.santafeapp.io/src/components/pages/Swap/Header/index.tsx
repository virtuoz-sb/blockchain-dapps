import cn from "classnames";
import styles from "../Swap.module.sass"
import plusSvg from "../../../../assets/img/icons/svg/plus.svg"
import settingSvg from "../../../../assets/img/icons/svg/setting.svg"

import { SWAP_MODAL_TYPE } from "../../../common/libs/constant";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { setModalType } from "../swapSlice";

const Header = () => {
  const dispatch = useAppDispatch()
  const modalType = useAppSelector((state: RootState) => state.swapSlice.modalType)
  return (<div className="flex">
    <div className="flex c-white">
      <span
        className={
          cn(
            "m-auto-v btn-hover mr-1 pointer",
            styles.tab,
            {
              [styles.active]: modalType === SWAP_MODAL_TYPE.SWAP
            }
          )
        }
        onClick={() => dispatch(setModalType(SWAP_MODAL_TYPE.SWAP))}
      >
        Swap
      </span>

      <span
        className={
          cn(
            "m-auto-v btn-hover mr-1 pointer",
            styles.tab,
            {
              [styles.active]: modalType === SWAP_MODAL_TYPE.LIQUIDITY
                || modalType === SWAP_MODAL_TYPE.ADD_LIQUIDITY
                || modalType === SWAP_MODAL_TYPE.REMOVE_LIQUIDITY
            }
          )
        }
        onClick={() => dispatch(setModalType(SWAP_MODAL_TYPE.LIQUIDITY))}
      >
        Liquidity
      </span>

      {/* <span
        className={
          cn(
            "m-auto-v btn-hover mr-1 disabled", 
            styles.tab, 
            { 
              [styles.active]: modalType === SWAP_MODAL_TYPE.BRIDGE 
            }
          )
        }
      >
        Bridge
      </span> */}
    </div>
    <div className="flex right">
      {/** Add Liquidity: ???????????????????? */}
      {/* <div
        className={
          cn(
            "my-2 mr-1 p-1 rounded pointer size-32px flex", 
            styles.tab, 
            { 
              [styles.active]: modalType === SWAP_MODAL_TYPE.LIQUIDITY 
            }
          )
        }
        onClick={() => dispatch(setModalType(SWAP_MODAL_TYPE.LIQUIDITY))}
        title="Add Liquidity"
        hidden={true}
      >
        <img 
          src={plusSvg} 
          className="img-white m-auto w-mx-100p" 
          alt="" 
        />
      </div> */}
      <div
        className={cn(
          "my-2 btn-hover p-1 rounded pointer size-32px flex",
          styles.tab,
          {
            [styles.active]: modalType === SWAP_MODAL_TYPE.SETTING
          }
        )}
        title="Settings"
        onClick={() => dispatch(setModalType(SWAP_MODAL_TYPE.SETTING))}
      >
        <img src={settingSvg} className="img-white m-auto" alt="" />
      </div>
    </div>
  </div>
  );
}

export default Header;