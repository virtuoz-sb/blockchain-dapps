import React, { FunctionComponent } from 'react';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';
import styles from './stable-requests.module.scss';
import RequestActions from '@components/horse-action/request/request-actions';

export type StableRequestsProps = {
  stableRequests: IStableRequest[];
  onRequestAction?: (type, request) => void;
  hasRequestActions?: boolean;
  [props: string]: any; // All other props
};

const getRequester = req => {
  return req ? <div className="text-blue-500 font-medium  truncate max-w-[200px]">{req}</div> : ' - ';
};

//isPublic isOwner show actions
export const StableRequests: FunctionComponent<StableRequestsProps> = ({
  stableRequests,
  hasRequestActions = false,
  onRequestAction,
  ...domProps
}) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('overflow-auto bg-blue-700', styles.stableRequestsTabWrapper)}>
      <div className={clsx('rounded-md bg-[#201F33]/50 overflow-auto pt-0 max-h-full')}>
        {stableRequests?.length > 0 && (
          <table className="w-full h-full text-sm" cellPadding={10}>
            <thead>
              <tr className="border-b border-gray-600">
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-0 z-10 bg-[#201F33]/50 text-left backdrop-filter text-white-500 font-medium"
                >
                  {t('stableRequests.expiry')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-0 z-10 hidden bg-[#201F33]/50 text-left backdrop-filter sm:table-cell text-white-500 font-medium"
                >
                  {t('stableRequests.horseName')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-0 z-10 hidden bg-[#201F33]/50 text-left backdrop-filter lg:table-cell text-white-500 font-medium"
                >
                  {t('stableRequests.from')}
                </th>
                {hasRequestActions && (
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky py-3 px-3 top-0 z-10 hidden bg-[#201F33]/50 text-left backdrop-filter lg:table-cell text-white-500 font-medium"
                  ></th>
                )}
              </tr>
            </thead>
            <tbody>
              {stableRequests.map(request => (
                <tr key={request.id} className="hover:bg-white/10">
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-left font-normal text-gray-200">
                    {`${request.stableTerm}`}
                  </th>
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 m-2 text-left font-medium text-gray-200">
                    {request.horseName}
                  </th>
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-left">
                    {getRequester(request.requester)}
                  </th>
                  {hasRequestActions && (
                    <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-left font-normal">
                      <RequestActions
                        onRequestAction={onRequestAction}
                        request={request}
                        acceptTxt={t('horseaction.acceptStableRequest.action')}
                        declineTxt={t('horseaction.declineStableRequest.action')}
                      />
                    </th>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
