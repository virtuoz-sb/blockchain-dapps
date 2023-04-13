const PaySection = (
  {
    tokenPay,
    isOrder,
    payBalance,
    payAmount,
    clickMaxPay,
    clickTokenSelect,
    enterPayAmount
  }: any
) => {
  return (
    <div className="flex-col">
      <p className="c-white text-base mb-1">
        You Pay
      </p>
      <div className="back-dark7 flex-col rounded-m p-3">
        <div className="flex">
          <span className="left fc-dark">
            {tokenPay.name}
            &nbsp;
            {isOrder ? "" : "(estimated)"}
          </span>
          <div className="right flex fc-dark">
            <span
              className="mr-2 pointer bold fc-green"
              onClick={() => clickMaxPay()}
            >
              MAX
            </span>
            {payBalance}
          </div>
        </div>
        <div className="flex flex-no-wrap white">
          <div
            className="flex mx-2 m-auto-v"
            onClick={() => clickTokenSelect(true)}
          >
            <div className="after-none flex flex-no-wrap  m-auto-v pointer">
              <img
                src={tokenPay.logoURI}
                className="size-32px rounded-50"
                alt=""
              />
              <span className="m-auto-v mx-1 pointer">
                {tokenPay.symbol}
              </span>
              <span className="m-auto-v">
                <i className="icofont-thin-down"></i>
              </span>
            </div>
          </div>

          <input
            type="text"
            className="right m-auto-v white blank-box w-fill sp-mx-w-160"
            placeholder="0.0"
            value={payAmount}
            onChange={(e) => enterPayAmount(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default PaySection;