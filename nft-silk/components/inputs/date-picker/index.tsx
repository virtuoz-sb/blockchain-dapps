import { forwardRef, FunctionComponent, HtmlHTMLAttributes, LegacyRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TextInputWithoutFormik } from '@components/inputs/text-input';
import { format } from 'date-fns';

export type SellModalProps = {
  selectedValue?: Date;
  updateEventSelectedValue?: any;
  className?: string;
  name?: string;
};

export const DateTimeComponent: FunctionComponent<SellModalProps> = ({
  selectedValue = new Date(),
  updateEventSelectedValue = undefined,
  className,
  name = 'duration',
}) => {
  const [startDate, setStartDate] = useState(selectedValue);

  useEffect(() => {
    // console.log(startDate);

    if (updateEventSelectedValue) {
      updateEventSelectedValue(startDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  const CustomCalendarInput = forwardRef((props: HtmlHTMLAttributes<DatePicker>, ref: LegacyRef<HTMLButtonElement>) => (
    <button className="w-full" onClick={props.onClick} ref={ref}>
      <TextInputWithoutFormik
        name={name}
        placeholder={name}
        data-test="duration-dt"
        className="text-sm"
        inputClassName="cursor-pointer"
        isSmall={false}
        iconName="calendar"
        editable={false}
        value={format(startDate, 'MMMM d, yyyy h:mm aa')}
      />
    </button>
  ));

  CustomCalendarInput.displayName = 'customCalendarInput';

  return (
    <div className={className}>
      <DatePicker
        portalId="sellDialogModal"
        showDisabledMonthNavigation
        showTimeInput
        minDate={new Date()}
        // minTime={setHours(setMinutes(new Date(), 0), 17)}
        selected={startDate}
        onChange={date => setStartDate(date)}
        dateFormat="MMMM d, yyyy h:mm aa"
        customInput={<CustomCalendarInput />}
        popperPlacement="bottom-end"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [5, 2],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'viewport',
              tether: false,
              altAxis: true,
            },
          },
        ]}
      />
    </div>
  );
};
