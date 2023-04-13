import React, { FC, useEffect, useState } from 'react';
import { debounce } from 'lodash-es';
import { TextInputWithoutFormik } from '@components/inputs/text-input';

interface Props {
  range1Name: string;
  range1Placeholder: string;
  range1DataTest: string;
  range2Name: string;
  range2Placeholder: string;
  range2DataTest: string;
  className?: string;
  isSmall: boolean;
  mask?: any;
  onChangeEventForMarketplace?: any;
  clearTextRangeValue?: boolean;
}

export const TextInputRange: FC<Props> = ({
  range1Name,
  range1Placeholder = '',
  range1DataTest,
  range2Name,
  range2Placeholder = '',
  range2DataTest,
  className = '',
  isSmall = false,
  mask,
  onChangeEventForMarketplace = null,
  clearTextRangeValue,
  ...props
}) => {
  const [range1Value, setRange1Value] = useState<string>();
  const [range2Value, setRange2Value] = useState<string>();

  const debounceFunc = debounce(() => {
    if (onChangeEventForMarketplace != null) {
      if (range1Value && range2Value && range1Value.length > 0 && range2Value.length > 0) {
        onChangeEventForMarketplace(range1Value, range2Value);
      } else {
        onChangeEventForMarketplace('', '');
      }
    }
  }, 2000);

  useEffect(() => {
    if (range1Value || range2Value) {
      debounceFunc();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range1Value, range2Value]);

  return (
    <div className={className}>
      <TextInputWithoutFormik
        name={range1Name}
        placeholder={range1Placeholder}
        data-test={range1DataTest}
        className="w-[50%] pr-1 text-sm"
        isSmall={isSmall}
        mask={mask}
        onChangeEventForMarketplace={setRange1Value}
        clearInputValue={clearTextRangeValue}
      />
      <TextInputWithoutFormik
        name={range2Name}
        placeholder={range2Placeholder}
        data-test={range2DataTest}
        className="w-[50%] pl-1 text-sm"
        isSmall={isSmall}
        mask={mask}
        onChangeEventForMarketplace={setRange2Value}
        clearInputValue={clearTextRangeValue}
      />
    </div>
  );
};
