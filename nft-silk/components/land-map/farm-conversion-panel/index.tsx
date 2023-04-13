import { useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { Popover } from '@headlessui/react';
import { map, times } from 'lodash-es';
import clsx from 'clsx';

import api from '@common/api';
import { Button } from '@components/button';
import { Dropdown } from '@components/inputs/dropdown';
import { Icon } from '@components/icons';
import { TextInput } from '@components/inputs/text-input';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import farmAbis from '@common/abi/farm';

import styles from './farm-conversion-panel.module.scss';

export type FarmConversionPanelProps = {
  isOpen: boolean;
  selectedLands: any[];
  onClose: Function;
  onNextStep: Function;
  onRefreshMapData: Function;
};

interface StableType {
  text: string;
  value: any;
}

const initialValues = {
  name: '',
  stablingPeriod: '3',
  ownerFee: '10.00%',
  destablingFee: '0.0001',
};

const FarmConversionSchema = Yup.object().shape({
  name: Yup.string().required(),
});

export const FarmConversionPanel = ({
  isOpen,
  selectedLands,
  onClose,
  onNextStep,
  onRefreshMapData,
  ...props
}: FarmConversionPanelProps) => {
  const { t } = useTranslation();
  const formikRef = useRef<FormikProps<any>>(null);
  const { account, chainId, Moralis } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [lands, setLands] = useState<any[]>([]);
  const [step, setStep] = useState<number>(1);
  const [farmName, setFarmName] = useState<string>(null);
  const [stableType, setStableType] = useState<StableType>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { getContractAddress } = useContractAddressStore();
  const { approveTransactionsForAddress, isTransactionsApprovedForAddress, pollTransaction } = useWalletStore();

  const stablingPeriods = [];
  const monthsHelpText = t('farmDevelopment.help.months');

  times(22, t => {
    stablingPeriods.push({ value: t + 3, label: `${t + 3} ${monthsHelpText}` });
  });

  const onCloseModal = (showDetail = null) => {
    onClose(showDetail);
  };

  const onSetStep = newStep => {
    setStep(newStep);
    onNextStep(newStep);
  };

  const options: StableType[] = [
    {
      text: 'Sky falls Founders Stable',
      value: 'founders',
    },
  ];

  const onSubmit = async values => {
    setIsSubmitting(true);
    setFarmName(values?.name);

    const farmContractAddress = await getContractAddress(ContractTypeEnum.Farm);

    try {
      const isApproved = await isTransactionsApprovedForAddress(
        native,
        account,
        ContractTypeEnum.Land,
        ContractTypeEnum.Farm
      );

      let approval = true;

      if (!isApproved) {
        approval = await approveTransactionsForAddress(Moralis, ContractTypeEnum.Land, ContractTypeEnum.Farm);
      }

      if (approval) {
        const conversion = await convertLandToFarm(values);

        onSetStep(step + 1);

        // create transaction in db to track fulfill call
        const fulfillPayload = {
          contractAddress: farmContractAddress,
          functionName: 'manualfulfill',
          isActive: true,
          walletAddress: account,
        };
        const { data: fulfillTrans } = await api.post(`/api/userTransaction`, fulfillPayload);

        const fulfillAbi = await farmManualFulfillAbi();
        const fulfill = await pollTransaction(Moralis, fulfillAbi, 30);

        // successfull fulfil call, update db to set active to false
        await api.put(`/api/userTransaction/field`, {
          id: fulfillTrans.userTransactionId,
          fieldName: 'IsActive',
          fieldValue: false,
        });

        onRefreshMapData();
      }
    } catch (error) {
      console.log('onsubmit error', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertLandToFarm = async formValues => {
    const tokenIds = map(selectedLands, l => l?.land?.tokenId);
    const farmContractAddress = await getContractAddress(ContractTypeEnum.Farm);
    const options = {
      chain: chainId,
      contractAddress: farmContractAddress,
      functionName: 'wrapLandtoFarmReq',
      abi: farmAbis.wrapLandToFarmReq,
      params: {
        ids: tokenIds,
        farmName: formValues.name.replaceAll(' ', '%20'),
        minTerm: formValues.stablingPeriod ? Number(formValues.stablingPeriod) : null,
        maxTerm: formValues.stablingPeriod ? Number(formValues.stablingPeriod) : null,
        destablingFee: BigInt(Moralis.Units.ETH(Number(formValues.destablingFee.replace(' ETH', '')))),
        ownerFee: formValues.ownerFee ? Number(formValues.ownerFee.replace('%', '')) : null,
        openFarm: false,
        stableID: 0,
      },
    };

    console.log('convertLandToFarm options', options);

    try {
      let result = await Moralis.executeFunction({
        ...options,
      });

      console.log('convertLandToFarm result', result);
      return result;
    } catch (error) {
      console.log('convertLandToFarm error', error);
      return Promise.reject(error);
    }
  };

  const farmManualFulfillAbi = async () => {
    const farmContractAddress = await getContractAddress(ContractTypeEnum.Farm);

    const abi = {
      chain: chainId,
      contractAddress: farmContractAddress,
      functionName: 'manualfulfill',
      abi: farmAbis.manualfulfill,
    };

    return abi;
  };

  useEffect(() => {
    if (isOpen) {
      setLands(selectedLands);
      onSetStep(1);
      setFarmName(null);
      setStableType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (selectedLands && lands !== selectedLands) {
      setLands(selectedLands);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLands]);

  return (
    <div className={clsx(styles.container, { [styles.open]: isOpen })}>
      <div className={clsx('flex flex-col text-white p-4 pb-0 text-left overflow-auto transform transition-all')}>
        <div className="cursor-pointer z-40 mt-1 fixed right-0">
          <Icon
            name="close"
            className="inline-block w-4 h-4 mr-3"
            color="var(--color-gray)"
            onClick={() => {
              onCloseModal(true);
            }}
            data-test="modal-close"
          />
        </div>

        <div className={clsx('font-bold text-3xl', styles.title)}>
          {step <= 3 && t('farmDevelopment.title')}
          {step === 4 && farmName}
        </div>

        {selectedLands && (
          <div className={styles.subTitle}>
            <span className="pr-1">{selectedLands.length}</span>
            {selectedLands.length === 1 ? t('farmDevelopment.acreFarm') : t('farmDevelopment.acresFarm')}
            <span className={styles.region}>{t('farmDevelopment.region')}</span>
            <span className="pl-1">{t('farmDevelopment.skyFalls')}</span>
          </div>
        )}

        {step === 1 && (
          <div
            className={clsx('grid gap-2 justify-items-center items-center', styles.farmPositions, {
              ['grid-cols-1']: selectedLands?.length === 1,
              ['grid-cols-2']: selectedLands?.length === 2,
              ['grid-cols-3']: selectedLands?.length === 3,
              ['grid-cols-4']: selectedLands?.length > 3,
            })}
          >
            {map(selectedLands, l => (
              <div className={clsx(styles.position)} key={l.id}>
                <Icon name="marker" color="var(--color-dark-yellow)" className="h-3 w-3 mr-2" />
                {l.position.x}, {l.position.y}
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            <Popover className={clsx('relative h-full', styles.stableTypes)}>
              {({ open, close }) => (
                <>
                  <Popover.Button className={clsx({ [styles.open]: open })}>
                    {stableType ? stableType.text : t('farmDevelopment.inputs.selectStable')}
                    <Icon name={open ? 'chevron-down' : 'chevron-up'} className="ml-2 h-3 w-3" />
                  </Popover.Button>
                  <Popover.Panel className="absolute w-full transform shadow-lg py-1 bg-slate-900 rounded-md focus:outline-none opacity-100 cursor-pointer">
                    <>
                      {map(options, item => (
                        <div
                          key={item.value}
                          onClick={() => {
                            setStableType(item);
                            close();
                          }}
                          className={clsx(
                            'rounded-t-lg border-b-2 border-gray-700/80 overflow-hidden hover:pl-5 group',
                            styles.stableType
                          )}
                        >
                          {item.text}
                        </div>
                      ))}
                    </>
                  </Popover.Panel>
                </>
              )}
            </Popover>

            <div className="mt-2">
              <img src="/images/sky-falls-founders-stable.png" alt="Stable" />
            </div>
          </>
        )}

        {step === 3 && (
          <Formik
            innerRef={formikRef}
            onSubmit={onSubmit}
            initialValues={initialValues}
            validationSchema={FarmConversionSchema}
          >
            {({}) => {
              return (
                <Form className={styles.form} data-test="farm-development-form">
                  <TextInput
                    name="name"
                    placeholder={t('farmDevelopment.inputs.name')}
                    showErrors={false}
                    isSmall={true}
                    mask={/^[A-Za-z0-9_ \-]{0,32}$/}
                    lazy={false}
                    required
                  />

                  <ul className={clsx('list-disc', styles.helpText)}>
                    <li>{t('farmDevelopment.help.length')}</li>
                    <li>{t('farmDevelopment.help.special')}</li>
                  </ul>

                  <div className={styles.header}>{t('farmDevelopment.stablingPeriod')}</div>

                  <Dropdown
                    name="stablingPeriod"
                    placeholder={t('farmDevelopment.inputs.stablingPeriod')}
                    options={stablingPeriods}
                    showErrors={false}
                    isSmall={true}
                  />

                  <div className={styles.header}>{t('farmDevelopment.ownerFee')}</div>

                  <TextInput
                    name="ownerFee"
                    placeholder={t('farmDevelopment.inputs.stablingFee')}
                    showErrors={false}
                    isSmall={true}
                    mask={'#%'}
                    lazy={false}
                    blocks={{
                      '#': {
                        mask: Number,
                        scale: 0,
                        min: 0,
                        max: 10,
                      },
                    }}
                    required
                  />

                  <TextInput
                    name="destablingFee"
                    className="mt-5 mb-5"
                    placeholder={t('farmDevelopment.inputs.destablingFee')}
                    showErrors={false}
                    isSmall={true}
                    mask={'# ETH'}
                    lazy={false}
                    blocks={{
                      '#': {
                        mask: Number,
                        scale: 4,
                        min: 0.0,
                        padFractionalZeros: true,
                        normalizeZeros: true,
                        radix: '.',
                      },
                    }}
                    required
                  />

                  <div className="mt-3 w-full">
                    <Button
                      color="primary"
                      notch="none"
                      className=""
                      buttonType="submit"
                      full={true}
                      disabled={!formikRef.current?.dirty || !formikRef.current?.isValid || isSubmitting}
                    >
                      {t('farmDevelopment.buttons.develop')}
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        )}

        {step === 4 && (
          <div className={styles.submitted}>
            <div className={styles.title}>{t('farmDevelopment.submitted.title')}</div>
            <div className={styles.description}>{t('farmDevelopment.submitted.description')}</div>

            <div className="mt-5 mb-2 w-full">
              <Button color="primary" notch="none" full={true} onClick={() => onCloseModal()}>
                {t('farmDevelopment.buttons.close')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-row mt-3">
          {step < 3 && (
            <>
              <div className="w-1/2 mr-4">
                <Button
                  chevrons="left"
                  fill="solid"
                  color="dark"
                  full={true}
                  notch="left"
                  uppercase={true}
                  onClick={() => {
                    if (step === 1) {
                      onCloseModal(true);
                    } else {
                      onSetStep(step - 1);
                    }
                  }}
                >
                  {step === 1 && t('farmDevelopment.buttons.cancel')}
                  {step > 1 && t('farmDevelopment.buttons.back')}
                </Button>
              </div>
              <div className="w-1/2">
                <Button
                  chevrons="right"
                  color="primary"
                  full={true}
                  notch="right"
                  uppercase={true}
                  onClick={() => onSetStep(step + 1)}
                  disabled={step === 2 && !stableType}
                >
                  {t('farmDevelopment.buttons.next')}
                </Button>
              </div>
            </>
          )}
        </div>

        {step <= 3 && (
          <div className={styles.stepNumber}>
            {t('farmDevelopment.step')} {step} {t('common.of')} 3
          </div>
        )}
      </div>
    </div>
  );
};
