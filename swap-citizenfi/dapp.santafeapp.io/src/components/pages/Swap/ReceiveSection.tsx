const ReceiveSection = (
  {
    tokenBuy, 
    isOrder, 
    receiveBalance, 
    receiveAmount, 
    clickTokenSelect, 
    enterReceiveAmount
  }: any
) => {
  return (
    <div className="flex-col mb-3">
      <p className=" c-white text-base mb-1">
        You Receive
      </p>
      <div className="back-dark7 flex-col rounded-m p-3">
        <div className="flex">
          <span className="left fc-dark">
            {tokenBuy.name}
            &nbsp;
            {!isOrder ? "" : "(estimated)"}
          </span>
          <span className="right fc-dark">
            {receiveBalance}
          </span>
        </div>
        <div className="flex flex-no-wrap">
          <div
            className="flex mx-2 m-auto-v"
            id="lang-sel-dropdown"
          >
            <div
              className="after-none flex flex-no-wrap  m-auto-v pointer"
              onClick={() => clickTokenSelect(false)}
            >
              <img
                src={tokenBuy.logoURI}
                className="size-32px rounded-50"
                alt=""
              />
              <span className="m-auto-v mx-1 pointer">
                {tokenBuy.symbol}
              </span>
              <span className="m-auto-v">
                <i className="icofont-thin-down"></i>
              </span>
            </div>
          </div>
          <input
            type="text"
            className="right m-auto-v blank-box w-fill white sp-mx-w-160"
            placeholder="0.0"
            value={receiveAmount}
            onChange={(e) => enterReceiveAmount(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default ReceiveSection;