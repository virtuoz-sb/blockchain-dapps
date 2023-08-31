import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Input, Select, Row, Col, Spin, Divider, Radio, Space, Slider, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import { Account } from "coinbase";

import { selectBlockchains } from '../../../store/network/network.selectors';
import { ELiquidatorBotStatus, ILiquidatorBot, ELiquidatorBotType, ECEXType } from '../../../types';
import { addLiquidatorBot, updateLiquidatorBot } from '../../../store/liquidatorBot/liquidatorBot.actions';
import { selectElapsedTime } from "../../../store/auth/auth.selectors";
import { selectMyCexAccounts } from "../../../store/cexAccount/cexAccount.selectors";
import { formattedNumber, showNotification } from '../../../shared';
import { walletService, coinMarketService } from 'services';
const erc20ABI = require("shared/erc20.json");

interface TokenInfo {
  symbol: string;
  coinSymbol: string;
  mainSymbol: string;
  explorer: string;
  totalSupply: number;
  // price: number;
  tokenName: string;
}

interface Props {
  visible: boolean,
  isDuplicate: boolean,
  selectedBot: ILiquidatorBot | null,
  setVisible: (visible: boolean) => void
};

export const AddCexLiquidatorBot = (props: Props) => {
  const { visible, isDuplicate, selectedBot, setVisible } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { Option } = Select;
  const chainData = useSelector(selectBlockchains);
  const cexAccountData = useSelector(selectMyCexAccounts);
  const elapsedTime = useSelector(selectElapsedTime);

  const [initTime, setInitTime] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [lowerPercent, setLowerPercent] = useState<string>('');
  const [kucoinAccountInfo, setKucoinAccountInfo] = useState<any>();
  
  useEffect(() => {
    if (!flag) {
      setInitTime(elapsedTime);
    }
    setFlag(true);

    const getTokenInfo = async () => {
      const blockchain = chainData.find(ch => ch._id === form.getFieldValue("blockchain"));
      const tokenAddress = form.getFieldValue("token");
      if (blockchain && tokenAddress && tokenAddress !== '' && blockchain.node?.rpcProviderURL) {
        try {
          let rpc = blockchain.node?.rpcProviderURL;
          const web3Client = new Web3(rpc);
          const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, tokenAddress);
          const symbol = await tokenErc20Contract.methods.symbol().call(); //--------
          const tokenName = await tokenErc20Contract.methods.name().call();
          let ti: any = {
            // ...tokenInfo,
            symbol,
            tokenName,
            mainSymbol: blockchain.coinSymbol,
            explorer: blockchain.explorer,
          };

          if (symbol && tokenName) {
            setTokenInfo(ti);
          }
        } catch (err) {
          return;
        }
      }
    }

    const onWalletRead = () => {
      const cexAccount = cexAccountData.find(el => el._id === form.getFieldValue("cexAccount"));
      if (cexAccount?._id) {
        walletService.getAccounts(cexAccount._id)
        .then(res => {
          if (form.getFieldValue('cex') === ECEXType.COINBASE && res?.length) {
            setAccounts(res);
          } else if (form.getFieldValue('cex') === ECEXType.KUCOIN && res) {
            setKucoinAccountInfo(res);
          }
        })
        .catch(err => {
          console.log("err", err);
        })
      }
    }

    if ((elapsedTime - initTime) % 3 === 0) {
      getTokenInfo();
      onWalletRead();
    }
  }, [elapsedTime, flag, initTime, chainData, form, cexAccountData, tokenInfo?.symbol]);

  useEffect(() => {
    if (tokenInfo?.symbol) {
      const blockchain = chainData.find(chain => chain._id === form.getFieldValue("blockchain"));
      if (!blockchain?.coinmarketcapNetworkId) return;
      const tokenAddress = form.getFieldValue("token");
      coinMarketService.getCoinmarketcapId(tokenInfo?.symbol, blockchain.coinmarketcapNetworkId, tokenAddress)
      .then(res => {
        coinMarketService.getCoinPrice(res)
        .then(res1 => {
          setTokenPrice(+res1);
        });
      })
    }
  }, [tokenInfo?.symbol, chainData]);

  const selectedAccountBalance = useMemo(() => {
    if (!accounts?.length) return 0;
    const acc = accounts.find(el => el.id === form.getFieldValue("account"));
    if (acc) {
      return +acc.balance.amount;
    } else {
      return 0;
    }
  }, [accounts, form]);

  useEffect(() => {
    if (!selectedBot) {
      return;
    }

    const formData: any = {
      blockchain: selectedBot.blockchain._id,
      token: selectedBot.token.address,
      account: selectedBot.accountId,
      cexAccount: selectedBot.cexAccount?._id,
      cex: selectedBot.cex,
      lowerPrice: selectedBot.lowerPrice,
      tokenAmount: selectedBot.tokenAmount,
      orderType: selectedBot.orderType? selectedBot.orderType : "MARKET_ORDER",
      timeInterval: String(selectedBot.timeInterval),
      rate: selectedBot.rate? selectedBot.rate : 1
    };
    form.setFieldsValue(formData);
  }, [form, selectedBot]);

  useEffect(() => {
    if (!selectedBot) {
      return;
    }

    const lowerP = (selectedBot.lowerPrice * 100 / tokenPrice) - 100;
    setLowerPercent(lowerP.toFixed(2));
  }, [selectedBot, tokenPrice]);

  const filteredAccounts = useMemo(() => {
    if (!accounts?.length) return [];
    let computed = accounts;
    if (tokenInfo) {
      computed = computed.filter(el => el.currency === tokenInfo.symbol);
    }

    return computed;
  }, [accounts, tokenInfo]);

  const filteredCexAccountData = () => {
    let computed = cexAccountData;
    computed = computed.filter(el => form.getFieldValue('cex') === undefined || el.cex === form.getFieldValue('cex'));
    return computed;
  };

  const handleCancel = () => {
    form.resetFields();
    setKucoinAccountInfo(null);
    setVisible(false);
  };

  const handlePercentChange = (value: string, type: string) => {
    switch(type) {
      case 'upper':
        // setUpperPercent(value);
        // form.setFieldsValue({upperPrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      case 'average':
        // setAveragePercent(value);
        // form.setFieldsValue({averagePrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      case 'lower':
        setLowerPercent(value);
        form.setFieldsValue({lowerPrice: (tokenPrice * (Number(value) + 100) / 100).toFixed(4)});
        break;
      default:
        break;
    }
  }

  const onFinish = (values: any) => {
    if (selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING) {
      setVisible(false);
      return;
    }

    if (values.cex === ECEXType.KUCOIN && !kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1]) {
      showNotification("Please top up tokens.", "info", 'topRight');
      return;
    }

    if (values.cex === ECEXType.COINBASE && !selectedAccountBalance) {
      showNotification("Please top up tokens.", "info", 'topRight');
      return;
    }

    const blockchain = chainData.find(chain => chain._id === values.blockchain);

    let payload: any = {
      blockchain: values.blockchain,
      node: blockchain?.node?._id,
      type: ELiquidatorBotType.CEX,
      accountId: values.account,
      cexAccount: values.cexAccount,
      cex: values.cex,
      lowerPrice: Number(values.lowerPrice),
      tokenAmount: Number(values.tokenAmount),
      state: ELiquidatorBotStatus.NONE,
      orderType: values.orderType,
      timeInterval: values.timeInterval? Number(values.timeInterval) : 0,
      rate: values.rate ? values.rate : 1
    };

    if (payload.cex === ECEXType.COINBASE && payload.tokenAmount > selectedAccountBalance) {
      showNotification("Token amount can't be higher than balance.", "error", 'topRight');
      return;
    }

    if (!selectedBot?._id || isDuplicate) {
      payload = {
        ...payload,
        token: values.token,
        tokenSold: 0,
      }
    }

    if (selectedBot?._id && !isDuplicate) {
      dispatch(updateLiquidatorBot(selectedBot._id, payload));
    } else {
      dispatch(addLiquidatorBot(payload));
    }

    setKucoinAccountInfo(null);
    form.resetFields();
    setVisible(false);
  };

  const setMaxTokenAmount = () => {
    if (form.getFieldValue('cex') === ECEXType.COINBASE) {
      form.setFieldsValue({tokenAmount: selectedAccountBalance});
    } else if (form.getFieldValue('cex') === ECEXType.KUCOIN) {
      form.setFieldsValue({tokenAmount: kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1] ? kucoinAccountInfo[tokenInfo?.symbol ? tokenInfo.symbol : -1] : 0});
    }
  }

  return (
    <Modal
      title="CEX Liquidator"
      visible={visible}
      width={1000}
      centered
      maskClosable={false}
      onOk={form.submit}
      okText={selectedBot?.state === ELiquidatorBotStatus.RUNNING ? 'Ok' : 'Save'}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        labelAlign='left'
        onFinish={onFinish}
      >
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              label="Chain"
              name="blockchain"
              rules={[{ required: true, message: 'Please select a chain!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {chainData.map((blockchain, idx) => (
                  <Option key={idx} value={blockchain._id}>{blockchain.name}  <span style={{ color: "#e8962e" }}>[{blockchain.coinSymbol}]</span>  ({blockchain.chainId})</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="CEX"
              name="cex"
              rules={[{ required: true, message: 'Please select a CEX!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                <Option value={ECEXType.COINBASE}>Coinbase</Option>
                <Option value={ECEXType.KUCOIN}>Kucoin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Token"
              name="token"
              rules={[{ required: true, message: 'Please enter token address!' }]}
            >
              <Input disabled={selectedBot?._id ? true : false} />
            </Form.Item>

            <div className="w-full p-3 text-sm border-solid border border-gray-dark mb-5">
              <Row gutter={24}>
                <Col span={14}>Symbol: </Col>
                <Col span={10} className="text-blue-light text-right">{tokenInfo ? tokenInfo.symbol : '---'}</Col>
              </Row>
              <Row gutter={24}>
                <Col span={10}>Token Name: </Col>
                <Col span={14} className="text-blue-light text-right">{tokenInfo ? tokenInfo.tokenName : '---'}</Col>
              </Row>
            </div>

            <Form.Item
              label="CEX Account"
              name="cexAccount"
              rules={[{ required: true, message: 'Please select!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {filteredCexAccountData().map((account, idx) => (
                  <Option key={idx} value={account._id}>
                    {account.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {accounts.length > 0 && <Form.Item
              label="Wallet"
              name="account"
              rules={[{ required: true, message: 'Please select account!' }]}
            >
              <Select className="w-28" disabled={selectedBot?._id ? true : false}>
                {filteredAccounts.map((account, idx) => (
                  <Option key={idx} value={account.id}>
                    {account.name} [{formattedNumber(Number(account.balance.amount))}]
                  </Option>
                ))}
              </Select>
            </Form.Item>}

            {tokenInfo && kucoinAccountInfo && form.getFieldValue('cex') === ECEXType.KUCOIN &&
              <div className='w-full text-right'>
                <span>{tokenInfo.symbol} : <span className='text-blue'>{formattedNumber(kucoinAccountInfo[tokenInfo.symbol])}</span></span>
                <span className='ml-3'>USDT: <span className='text-blue'>{formattedNumber(kucoinAccountInfo["USDT"])}</span></span>
              </div>
            }
          </Col>

          <Col span={1}>
            <Divider type="vertical" className='h-full border-gray-dark'> </Divider>
          </Col>

          {tokenInfo && (accounts.length > 0 || kucoinAccountInfo) && <Col span={11}>
            <Row className='mb-6 flex items-center'>
              <Col span={8}>
                <div>Token Price</div>
              </Col>
              <Col span={16}>
                <Input 
                  placeholder='0'
                  prefix="$"
                  value={formattedNumber(tokenPrice)}
                  disabled
                />
              </Col>
            </Row>
            
            <Form.Item
              name="orderType"
              label={
                <>
                <span className='text-red mr-1'>*</span>
                <span>Order Type</span>
                </>
              }
              initialValue="MARKET_ORDER"
            >
              <Radio.Group>
                <Radio value="MARKET_ORDER">
                  <span className='mr-1'>Market Order</span>
                  <Tooltip title="Market Order executes a trade immediately at the best available price (the price can sometimes go a little lower than the limit given).">
                    <QuestionCircleOutlined className='text-sm' />
                  </Tooltip>
                </Radio>
                <Radio value="LIMIT_ORDER">
                  <span className='mr-1'>Limit Order</span>
                  <Tooltip title="Limit Order only executes when the market trades at a certain price (the price will never go below the limit given).">
                    <QuestionCircleOutlined className='text-sm' />
                  </Tooltip>
                </Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              label={
                <>
                <span className='text-red mr-1'>*</span>
                <span>Stop Price</span>
                </>
              }
            >
              <Space>
                <Form.Item
                  name="lowerPrice"
                  rules={[
                    { required: true, message: 'Please enter price limit!' },
                    {
                      validator: async (_, lowerPrice) => {
                        if (lowerPrice < 0) {
                          return Promise.reject(new Error('Invalid value'))
                        }
                      }
                    }
                  ]}
                  noStyle
                >
                  <Input 
                    className='w-36'
                    placeholder='0'
                    prefix="$"
                    type="number"
                    onChange={(e)=>{setLowerPercent(((Number(e.target.value) * 100 / tokenPrice)-100).toFixed(2))}}
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                  />
                </Form.Item>
                <Input 
                  className='w-32 ml-1'
                  placeholder='0'
                  suffix="%"
                  type="number"
                  value={lowerPercent}
                  onChange={(e)=>handlePercentChange(e.target.value, 'lower')}
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                />
              </Space>
            </Form.Item>

            <Form.Item
              label={
                <>
                <span className='text-red mr-1'>*</span>
                <span>Token Amount</span>
                </>
              }
            >
              <Space>
                <Form.Item 
                  name="tokenAmount"
                  rules={[{ required: true, message: 'Please enter token amount!' }]}
                  noStyle
                >
                  <Input
                    className='w-36'
                    type="number"
                    // max={selectedAccountBalance}
                    // min={0}
                    suffix={tokenInfo.symbol}
                    placeholder="0"
                    disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false} 
                  />
                </Form.Item>
                <Button 
                  className='w-32 ml-1'
                  onClick={setMaxTokenAmount}
                  disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
                >
                  MAX
                </Button>
              </Space>
            </Form.Item>

            <Form.Item
              label="Time Interval"
              name="timeInterval"
              rules={[
                { required: true, message: 'Please input time interval!' },
                {
                  validator: async (_, timeInterval) => {
                    if (timeInterval < 5) {
                      return Promise.reject(new Error('Should be greater than 5'))
                    }
                  }
                }
              ]}
            >
              <Input
                suffix="min" 
                type="number"
                placeholder='0'
                disabled={selectedBot && selectedBot.state === ELiquidatorBotStatus.RUNNING ? true : false}
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.orderType !== currentValues.orderType}
            >
              {({ getFieldValue }) =>
                getFieldValue('orderType') === "MARKET_ORDER" ? (
                  <Form.Item
                    name="rate"
                    label={
                      <>
                      <span className='text-red mr-1'>*</span>
                      <span>Depth Coefficient</span>
                      </>
                    }
                    initialValue={1}
                  >
                    <Slider
                      max={2}
                      min={0.1}
                      step={0.1}
                      marks={{
                        0.1: 0.1,
                        1: 1,
                        2: 2,
                      }}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Col>}

          {(!tokenInfo || (accounts.length < 1 && !kucoinAccountInfo)) && <Col span={11}>
            <div className='flex justify-center items-center'>
              <Spin />
            </div>
          </Col>}
        </Row>
      </Form>
    </Modal>
  );
};
