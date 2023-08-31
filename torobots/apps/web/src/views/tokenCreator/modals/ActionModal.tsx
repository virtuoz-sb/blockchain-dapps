import { useEffect, useState } from 'react';
import { Modal, Form, Button, Input, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { tokenService } from 'services';
import Web3 from "web3";
import BigNumber from 'bignumber.js';

import { selectTokenCreators } from 'store/tokenCreator/tokenCreator.selectors';
import { ITokenCreator } from 'types';
const erc20ABI = require("shared/erc20.json");
interface Props {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  type: string,
  botId: string
}

export const ActionModal = (props: Props) => {
  const { visible, setVisible, type, botId } = props;

  const [creatorBot, setCreatorBot] = useState<ITokenCreator>();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalSupply, setTotalSupply] = useState<BigNumber>(new BigNumber(0));
  const [balance, setBalance] = useState<BigNumber>(new BigNumber(0));
  const tokenCreators = useSelector(selectTokenCreators);

  useEffect(() => {
    if (botId) {
      const creator = tokenCreators.find(el => el._id === botId);
      setCreatorBot(creator);
    }
  }, [botId, tokenCreators]);

  const getTokenTotalSupply = async () => {
    if (!creatorBot) {return 0;}
    setIsLoading(true);
    try {
      const web3Client = new Web3(creatorBot.node.rpcProviderURL);
      const tokenErc20Contract = new web3Client.eth.Contract(erc20ABI, creatorBot.token?.address);
      const decimals = await tokenErc20Contract.methods.decimals().call();
      const _totalSupply = await tokenErc20Contract.methods.totalSupply().call();
      const _balance = await tokenErc20Contract.methods.balanceOf(creatorBot.wallet.publicKey).call();
      setBalance(new BigNumber(_balance).shiftedBy(-Number(decimals)));
      setTotalSupply(new BigNumber(_totalSupply).shiftedBy(-Number(decimals)));
      setIsLoading(false);
    } catch (e) {
      console.log(e)
      setTotalSupply(new BigNumber(0));
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!creatorBot?._id) {return;}
    if (creatorBot.node.rpcProviderURL === '' || !creatorBot.token?.address) {
      setTotalSupply(new BigNumber(0));
    } else {
      getTokenTotalSupply();
    }
  }, [
    creatorBot?._id,
    creatorBot?.node.rpcProviderURL,
    creatorBot?.token?.address
  ])

  useEffect(() => {
  }, [form]);

  const onFinish = (values: any) => {
    const amount = values.amount;
    if (botId) {
      if (type === "Mint") {
        tokenService.mintToken({ amount: amount, creatorId: botId })
          .then(res => { console.log("r----->", res); })
          .catch(err => { console.log("e----->", err); })
      }
      if (type === "Burn") {
        tokenService.burnToken({ amount: amount, creatorId: botId })
          .then(res => { console.log("r----->", res); })
          .catch(err => { console.log("e----->", err); })
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      form.resetFields();
      setIsLoading(false);
      setVisible(false);
    }, 2000);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  const handleMax = () => {
    if (!creatorBot) {return;}
    if (type === "Mint") {
      console.log(creatorBot.maxSupply);
      console.log(totalSupply.toString());
      form.setFieldsValue({ 'amount': new BigNumber(Number(creatorBot.maxSupply)).minus(totalSupply).toString() })
    } else {
      form.setFieldsValue({ 'amount': balance.toString() })
    }
  }

  return (
    <Modal
      title={type}
      visible={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Ok"
      confirmLoading={isLoading}
    >
      {(creatorBot && !isLoading) ? <Form
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label={type === "Mint" ? 'Mint Amount' : 'Burn Amount'}
        >
          <Form.Item
            name="amount"
            noStyle
            rules={[{ required: true, message: 'Please input amount!' },
              {
                validator: async (_, amount) => {
                  if (type === "Mint") {
                    if (new BigNumber(amount).isGreaterThan(new BigNumber(Number(creatorBot.maxSupply)).minus(totalSupply))) {
                      return Promise.reject(new Error('Overflow...'))
                    } else if (new BigNumber(amount).isLessThan(0)) {
                      return Promise.reject(new Error('Invalid value...'))
                    }
                  } else {
                    if (new BigNumber(amount).isGreaterThan(balance)) {
                      return Promise.reject(new Error('Overflow...'))
                    } else if (new BigNumber(amount).isLessThan(0)) {
                      return Promise.reject(new Error('Invalid value...'))
                    }
                  }
                }
              }
            ]}
          >
            <Input
              type={'number'}
              className='w-64'
            />
          </Form.Item>
          <Button type="primary" onClick={handleMax}>Max</Button>
        </Form.Item>
      </Form> : <div className='flex justify-center'>
        <Spin />
      </div>
      }
    </Modal>
  );
};
