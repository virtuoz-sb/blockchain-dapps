import { FunctionComponent } from 'react';
import { ActionButton } from '@components/table/cells';

type RequestActionsProps = {
  acceptTxt?: string;
  declineTxt?: string;
  request?: any;
  onRequestAction: (type, request) => void;
};

const RequestActions: FunctionComponent<RequestActionsProps> = ({
  acceptTxt,
  declineTxt,
  request,
  onRequestAction,
}) => {
  return (
    <div className="flex space-x-2">
      <ActionButton onHandleAction={() => onRequestAction('accept', request)} actionTxt={acceptTxt} />
      <ActionButton onHandleAction={() => onRequestAction('decline', request)} actionTxt={declineTxt} />
    </div>
  );
};

export default RequestActions;
